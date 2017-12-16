const fetch = require('node-fetch');
const baseApi = 'https://api.gdax.com/products';

const currencyToMarketMap = {
  BTC: 'BTC-USD',
  ETH: 'ETH-USD',
  LTC: 'LTC-USD'
};

const getPrice = currency => {
  return fetch(`${baseApi}/${currencyToMarketMap[currency]}/ticker`)
    .then(res => {
      if (!res.ok) {
        throw new Error('Failed to fetch from gdax');
      }
      return res.json();
    })
    .then(payload => {
      return {
        exchange: 'gdax',
        currency,
        bid: payload['bid'],
        ask: payload['ask']
      };
    })
    .catch(err => {
      throw err; // Bubble up
    });
};

const getPricePromises = currencies => {
  const pricePromises = [];

  currencies.forEach(currency => {
    if (currencyToMarketMap[currency]) {
      pricePromises.push(getPrice(currency));
    } else {
      console.log(`gdax does not support ${currency}`);
    }
  });

  return pricePromises;
};

module.exports = {
  getPricePromises
};
