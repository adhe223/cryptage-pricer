const fetch = require('node-fetch');

const apiBase = 'https://api.binance.com/api/v1/ticker';
let apiPromiseLastFetchTime;
let apiPromiseCache;

const getAllTickerDataPromise = () => {
  if (!pricesOlderThan30Seconds()) {
    return apiPromiseCache;
  }

  return fetch(`${apiBase}/allPrices`)
    .then(res => {
      if (!res.ok) {
        throw new Error('Failed fetching prices from Binance');
      }
      return res.json();
    })
    .then(priceData => {
      apiPromiseLastFetchTime = new Date();
      return priceData;
    })
    .catch(err => {
      throw err;
    });
};

const thirtySeconds = 30 * 1000;
const pricesOlderThan30Seconds = () => {
  if (!apiPromiseLastFetchTime) {
    return true;
  }
  if (apiPromiseLastFetchTime - new Date() > thirtySeconds) {
    return true;
  }
  return false;
};

module.exports = {
  getAllTickerDataPromise
};
