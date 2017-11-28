const keys = require('../../keys');
const Client = require('coinbase').Client;
const client = new Client({
  apiKey: keys.coinbase.apiKey,
  apiSecret: keys.coinbase.apiSecret
});

const getPrice = currency => {
  return new Promise((resolve, reject) => {
    try {
      client.getExchangeRates({ currency }, (err, payload) => {
        if (err) {
          return reject(err);
        }
        console.log(payload.data.rates['USD']);
        return resolve(payload.data.rates['USD']);
      });
    } catch (err) {
      return reject(err);
    }
  });
};

module.exports = {
  getPrice
};
