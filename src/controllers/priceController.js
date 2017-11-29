const coinbase = require('../exchanges/coinbase');
const bittrex = require('../exchanges/bittrex');
const bithumb = require('../exchanges/bithumb');
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
      const disparityPayload = {};
      currencies.forEach(currency => {
        disparityPayload[currency] =
          priceData['coinbase'][currency] / priceData['bittrex'][currency];
      });

      res.send(disparityPayload);
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

module.exports = {
  getPrices,
  getPriceDisparity
};
