const fetch = require('node-fetch');
const baseApi = 'https://api.coinbase.com/v2/exchange-rates';

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

module.exports = {
  getPrice
};
