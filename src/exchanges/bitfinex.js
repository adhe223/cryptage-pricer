const fetch = require('node-fetch');

const apiBase = 'https://api.bitfinex.com/v1';
const currencyToMarketMap = {
  BTC: 'BTCUSD',
  ETH: 'ETHUSD',
  BCC: 'BCHUSD',
  LTC: 'LTCUSD',
  XMR: 'XMRUSD',
  NEO: 'NEOUSD'
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
        bid: payload['bid'],
        ask: payload['ask']
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
      console.log(`Bitfinex does not support ${currency}`);
    }
  });

  return pricePromises;
};

module.exports = {
  getPricePromises
};
