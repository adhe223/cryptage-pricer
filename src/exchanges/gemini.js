const fetch = require('node-fetch');

const apiBase = 'https://api.gemini.com/v1/pubticker';
const currencyToSymbolMap = {
  BTC: 'btcusd',
  ETH: 'ethusd'
};

const getPrice = currency => {
  if (!currencyToSymbolMap[currency]) {
    return;
  }

  return fetch(`${apiBase}/${currencyToSymbolMap[currency]}`)
    .then(res => {
      if (!res.ok) {
        throw new Error('Failed to fetch from gemini');
      }
      return res.json();
    })
    .then(payload => {
      return {
        exchange: 'gemini',
        currency,
        price: payload['ask']
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
      console.log(`Gemini does not support ${currency}`);
    }
  });

  return pricePromises;
};

module.exports = {
  getPricePromises
};
