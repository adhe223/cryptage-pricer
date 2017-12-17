const fetch = require('node-fetch');

const apiBase = 'https://www.cryptopia.co.nz/api';
const currencyToMarketMap = {
  BTC: 'BTC_USDT',
  ETH: 'ETH_USDT',
  BCC: 'BCH_USDT',
  XMR: 'XMR_USDT',
  LTC: 'LTC_USDT'
};

const getPrice = currency => {
  return fetch(`${apiBase}/GetMarket/${currencyToMarketMap[currency]}`)
    .then(res => {
      if (!res.ok) {
        throw new Error('Failed to fetch from cryptopia');
      }
      return res.json();
    })
    .then(payload => {
      if (!payload['Success']) {
        throw new Error('Failed to fetch price from cryptopia');
      }
      return {
        exchange: 'cryptopia',
        currency,
        bid: payload['Data']['BidPrice'],
        ask: payload['Data']['AskPrice']
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
      console.log(`Cryptopia does not support ${currency}`);
    }
  });

  return pricePromises;
};

module.exports = {
  getPricePromises
};
