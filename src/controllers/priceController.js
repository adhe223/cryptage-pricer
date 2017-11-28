const coinbase = require('../exchanges/coinbase');
const bittrex = require('../exchanges/bittrex');
const supportedCurrencies = require('../currencies');

const getPrices = (req, res) => {
  console.log('Finding prices');

  const currencies = req.body.currencies || supportedCurrencies;
  const pricePromises = [];

  currencies.forEach(currency => {
    pricePromises.push(coinbase.getPrice(currency));
    pricePromises.push(bittrex.getPrice(currency));
  });

  Promise.all(pricePromises)
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

      res.send(pricePayload);
      res.end();
    })
    .catch(err => {
      console.log(err);
    });
};

module.exports = {
  getPrices
};
