module.exports = app => {
  const price = require('../controllers/priceController');

  app.route('/price').get(price.getPrices);
};
