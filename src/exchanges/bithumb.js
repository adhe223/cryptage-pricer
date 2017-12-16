const fetch = require('node-fetch');
const fiatConverter = require('../FiatConverter');
const baseApi = 'https://api.bithumb.com/public/ticker/';

const supportedCurrencies = {
  BTC: true,
  ETH: true,
  BCH: true,
  LTC: true,
  XMR: true
};

const getPrice = (currency, converter) => {
  return fetch(`${baseApi}/${currency}`)
    .then(res => {
      if (!res.ok) {
        throw new Error('Failed to fetch from bithumb');
      }
      return res.json();
    })
    .then(payload => {
      if (payload.status !== '0000') {
        throw new Error('Error fetching from bithumb');
      }

      const buyConversion = fiatConverter.convert(payload.sell_price, 'KRW');
      const askConversion = fiatConverter.convert(payload.data.buy_price, 'KRW');

      return Promise.all([buyConversion, askConversion]);
    })
    .then(usdAmounts => {
      return {
        exchange: 'bithumb',
        currency,
        bid: usdAmounts[0],
        ask: usdAmounts[1]
      };
    })
    .catch(err => {
      throw err; // Bubble up
    });
};

const getPricePromises = currencies => {
  const pricePromises = [];

  currencies.forEach(currency => {
    if (supportedCurrencies[currency]) {
      pricePromises.push(getPrice(currency));
    } else {
      console.log(`Bithumb does not support ${currency}`);
    }
  });

  return pricePromises;
};

module.exports = {
  getPricePromises
};
