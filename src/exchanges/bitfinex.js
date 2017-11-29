const fetch = require('node-fetch');

const apiBase = 'https://api.bitfinex.com/v1';
const currencyToMarketMap = {
  BTC: 'BTCUSD',
  ETH: 'ETHUSD',
  LTC: 'LTCUSD'
};

const getPrice = currency => {
  return fetch(`${apiBase}/pubticker/${currencyToMarketMap[currency]}`)
    .then(res => {
      if (!res.ok) {
        throw new Error('Failed to fetch from bitfinex');
      }
      return res.json();
    })
    .then(payload => {
      return {
        exchange: 'bitfinex',
        currency,
        price: payload['ask']
      };
    })
    .catch(err => {
      throw err; // Bubble up!
    });
};

module.exports = {
  getPrice
};
