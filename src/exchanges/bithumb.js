const fetch = require('node-fetch');
const fiatConverter = require('../FiatConverter');
const baseApi = 'https://api.bithumb.com/public/ticker/';

const getPrice = (currency, converter) => {
  return fetch(`${baseApi}/${currency}`)
    .then(res => {
      if (!res.ok) {
        throw new Error('Failed to fetch from coinbase');
      }
      return res.json();
    })
    .then(payload => {
      if (payload.status !== '0000') {
        throw new Error('Error fetching from bithumb');
      }
      return fiatConverter.convert(payload.data.buy_price, 'KRW');
    })
    .then(usdAmount => {
      return {
        exchange: 'bithumb',
        currency,
        price: usdAmount
      };
    })
    .catch(err => {
      throw err; // Bubble up
    });
};

module.exports = {
  getPrice
};
