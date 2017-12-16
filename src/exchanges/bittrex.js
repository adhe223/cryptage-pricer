const fetch = require('node-fetch');

const apiBase = 'https://bittrex.com/api/v1.1/public/getticker';
const currencyToMarketMap = {
  BTC: 'USDT-BTC',
  ETH: 'USDT-ETH',
  BCC: 'USDT-BCC',
  XMR: 'USDT-XMR',
  LTC: 'USDT-LTC',
  NEO: 'USDT-NEO'
};

const getPrice = currency => {
  return fetch(`${apiBase}?market=${currencyToMarketMap[currency]}`)
    .then(res => {
      if (!res.ok) {
        throw new Error('Failed to fetch from bittrex');
      }
      return res.json();
    })
    .then(payload => {
      if (!payload.success) {
        throw new Error('Failed to fetch price from bittrex');
      }
      return {
        exchange: 'bittrex',
        currency,
        bid: payload.result['Bid'],
        ask: payload.result['Ask']
      };
    })
    .catch(err => {
      throw err; // Bubble up!
    });
};

const getPricePromises = currencies => {
  const pricePromises = [];

  currencies.forEach(currency => {
    if (currencyToMarketMap[currency]) {
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
