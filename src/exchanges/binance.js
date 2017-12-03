const binanceHelper = require('./helpers/binanceHelper');

const currencyToSymbolMap = {
  ETH: 'ETHBTC',
  BCC: 'BCCBTC',
  XRP: 'XRPBTC',
  DASH: 'DASHBTC',
  LTC: 'LTCBTC'
};

const getPrice = currency => {
  return binanceHelper
    .getAllTickerDataPromise()
    .then(priceData => {
      const symbol = currencyToSymbolMap[currency];
      return priceData[symbol];
    })
    .catch(err => {
      throw err;
    });
};

module.exports = {
  getPrice
};
