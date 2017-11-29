const coinbase = require('../exchanges/coinbase');
const bittrex = require('../exchanges/bittrex');
const bithumb = require('../exchanges/bithumb');
const bitfinex = require('../exchanges/bitfinex');
const supportedCurrencies = require('../currencies');
const supportedExchanges = require('../exchanges/supported');

const getPrices = (req, res) => {
  const currencies = req.body.currencies || supportedCurrencies;
  _getPrices(currencies)
    .then(priceData => {
      res.send(priceData);
      res.end();
    })
    .catch(err => {
      console.log(err);
      res.send(err);
      res.end();
    });
};

const getPriceDisparity = (req, res) => {
  const currencies = req.body.currencies || supportedCurrencies;
  _getPrices(currencies)
    .then(priceData => {
      // const disparityPayload = {};
      // currencies.forEach(currency => {
      //   disparityPayload[currency] =
      //     priceData['coinbase'][currency] / priceData['bittrex'][currency];
      // });

      res.send(_generateDisparityPayload(priceData));
      res.end();
    })
    .catch(err => {
      console.log(err);
      res.send(err);
      res.end();
    });
};

const _getPrices = currencies => {
  const pricePromises = [];

  currencies.forEach(currency => {
    pricePromises.push(coinbase.getPrice(currency));
    pricePromises.push(bittrex.getPrice(currency));
    pricePromises.push(bithumb.getPrice(currency));
    pricePromises.push(bitfinex.getPrice(currency));
  });

  return Promise.all(pricePromises)
    .then(exchangeRates => {
      const pricePayload = {};
      Object.keys(exchangeRates).forEach(exchangeRateKey => {
        const exchange = exchangeRates[exchangeRateKey].exchange;
        const currency = exchangeRates[exchangeRateKey].currency;
        const price = exchangeRates[exchangeRateKey].price;

        if (!pricePayload[exchange]) {
          pricePayload[exchange] = {};
        }

        pricePayload[exchange][currency] = price;
      });

      return pricePayload;
    })
    .catch(err => {
      throw new Error(err); // Bubble up!
    });
};

const _generateDisparityPayload = pricePayload => {
  const disparityObject = {};
  const exchanges = Object.keys(pricePayload);
  const currencies = Object.keys(pricePayload[exchanges[0]]);

  for (let i = 0; i < exchanges.length; i++) {
    const currentExchange = exchanges[i];
    // Look at the other exchanges
    for (let j = 0; j < exchanges.length; j++) {
      if (i === j) {
        continue;
      }

      const comparisonExchange = exchanges[j];

      currencies.forEach(currency => {
        const ratio =
          pricePayload[currentExchange][currency] / pricePayload[comparisonExchange][currency];
        disparityObject[`${currentExchange}-${comparisonExchange}-${currency}`] = {
          currency,
          ratio
        };
      });
    }
  }

  const sortedKeys = Object.keys(disparityObject).sort((a, b) => {
    return parseFloat(disparityObject[b].ratio) - parseFloat(disparityObject[a].ratio);
  });
  const sortedDisparity = [];

  sortedKeys.forEach(key => {
    sortedDisparity.push({
      exchangePair: key,
      currency: disparityObject[key].currency,
      ratio: disparityObject[key].ratio
    });
  });

  return sortedDisparity;
};

module.exports = {
  getPrices,
  getPriceDisparity
};
