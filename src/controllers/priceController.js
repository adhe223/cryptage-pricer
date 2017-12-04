const coinbase = require('../exchanges/coinbase');
const bittrex = require('../exchanges/bittrex');
const bitfinex = require('../exchanges/bitfinex');
const gemini = require('../exchanges/gemini');
const binance = require('../exchanges/binance');
const supportedCurrencies = require('../currencies');

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
  const pricePromises = [
    ...coinbase.getPricePromises(currencies),
    ...bittrex.getPricePromises(currencies),
    ...bitfinex.getPricePromises(currencies),
    ...gemini.getPricePromises(currencies),
    ...binance.getPricePromises(currencies)
  ];

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

  for (let i = 0; i < exchanges.length; i++) {
    const currentExchange = exchanges[i];

    // Look at the other exchanges
    for (let j = 0; j < exchanges.length; j++) {
      const comparisonExchange = exchanges[j];
      if (currentExchange === comparisonExchange) {
        continue;
      }

      const currencies = Object.keys(pricePayload[exchanges[i]]);
      currencies.forEach(currency => {
        if (!pricePayload[comparisonExchange][currency]) {
          // Comparison exchange doesn't support this currency, move on
          return;
        }

        const ratio =
          pricePayload[currentExchange][currency] / pricePayload[comparisonExchange][currency];
        const potentialPercGain = (ratio - 1) * 100;

        disparityObject[`${currentExchange}-${comparisonExchange}-${currency}`] = {
          currency,
          potentialPercGain
        };
      });
    }
  }

  const sortedKeys = Object.keys(disparityObject).sort((a, b) => {
    return (
      parseFloat(disparityObject[b].potentialPercGain) -
      parseFloat(disparityObject[a].potentialPercGain)
    );
  });
  const sortedDisparity = [];

  sortedKeys.forEach(key => {
    sortedDisparity.push({
      exchangePair: key,
      currency: disparityObject[key].currency,
      potentialPercGain: disparityObject[key].potentialPercGain
    });
  });

  return sortedDisparity;
};

module.exports = {
  getPrices,
  getPriceDisparity
};
