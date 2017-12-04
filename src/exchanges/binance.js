const fetch = require('node-fetch');

const apiBase = 'https://api.binance.com/api/v1/depth';
const currencyToSymbolMap = {
  BTC: 'BTCUSDT',
  ETH: 'ETHUSDT',
  BCC: 'BCCUSDT',
  NEO: 'NEOUSDT'
};

const getPrice = currency => {
  return fetch(`${apiBase}?symbol=${currencyToSymbolMap[currency]}`)
    .then(res => {
      if (!res.ok) {
        throw new Error('Failed to fetch from binance');
      }
      return res.json();
    })
    .then(payload => {
      return {
        exchange: 'binance',
        currency,
        price: payload.bids[0][0] // Wow their API is trash
      };
    })
    .catch(err => {
      throw err; // Bubble up!
    });
};

const getPricePromises = currencies => {
  const pricePromises = [];

  currencies.forEach(currency => {
    if (currencyToSymbolMap[currency]) {
      pricePromises.push(getPrice(currency));
    } else {
      console.log(`Binance does not support ${currency}`);
    }
  });

  return pricePromises;
};

module.exports = {
  getPricePromises
};
