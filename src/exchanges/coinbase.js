// TODO: Switch to GDAX API. But should be close in the meantime

const fetch = require('node-fetch');
const baseApi = 'https://api.coinbase.com/v2/exchange-rates';

const supportedCurrencies = {
  BTC: true,
  ETH: true,
  LTC: true
};

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
        bid: payload.data.rates['USD'], // TODO: Don't cheat here. Okay for now because coinbase will be a small spread
        ask: payload.data.rates['USD']
      };
    })
    .catch(err => {
      throw err; // Bubble up
    });
};

const getPricePromises = currencies => {
  const pricePromises = [];

  currencies.forEach(currency => {
    if (supportedCurrencies[currency]) {
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
