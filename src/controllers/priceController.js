const coinbase = require('../exchanges/coinbase');

const getPrices = (req, res) => {
  console.log('Finding prices');
  if (!req.body.currencies) {
    getAllPrices(req, res);
  }

  // Get specific currencies based on request
};

const getAllPrices = (req, res) => {
  console.log('Finding all prices');
  coinbase
    .getPrice('BTC')
    .then(price => {
      res.send({
        btc: price
      });
      res.end();
    })
    .catch(err => {
      console.log(err);
    });
};

module.exports = {
  getPrices
};
