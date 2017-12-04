const fetch = require('node-fetch');
const baseApi = 'https://api.coinbase.com/v2/exchange-rates';

const supportedCurrencies = {
  BTC: true,
  ETH: true,
  LTC: true
};

const getPrice = currency => {
  return fetch(`${baseApi}?currency=${currency}`)
    .then(res => {
      if (!res.ok) {
        throw new Error('Failed to fetch from coinbase');
      }
      return res.json();
    })
    .then(payload => {
      return {
        exchange: 'coinbase',
        currency,
        price: payload.data.rates['USD']
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
      console.log(`Bittrex does not support ${currency}`);
    }
  });

  return pricePromises;
};

module.exports = {
  getPricePromises
};
