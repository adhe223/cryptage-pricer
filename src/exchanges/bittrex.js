const fetch = require('node-fetch');

const apiBase = 'https://bittrex.com/api/v1.1/public/getticker';
const currencyToMarketMap = {
  BTC: 'USDT-BTC',
  ETH: 'USDT-ETH',
  LTC: 'USDT-LTC'
};

const getPrice = currency => {
  return fetch(`${apiBase}?market=${currencyToMarketMap[currency]}`)
    .then(res => {
      return res.json();
    })
    .then(payload => {
      if (!payload.success) {
        throw new Error('Failed to fetch price from bittrex');
      }
      return {
        exchange: 'bittrex',
        currency,
        price: payload.result['Ask']
      };
    })
    .catch(err => {
      throw new Error(err); // Bubble up!
    });
};

module.exports = {
  getPrice
};
