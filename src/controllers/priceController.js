const promiseSettle = require('promise-settle');

const gdax = require('../exchanges/gdax');
const bittrex = require('../exchanges/bittrex');
const gemini = require('../exchanges/gemini');
const binance = require('../exchanges/binance');
const supportedCurrencies = require('../currencies');

const getPrices = (req, res) => {
  const currencies = req.body.currencies || supportedCurrencies;
  _getPrices(currencies)
    .then(priceData => {
      res.send(priceData);
      res.end();
    })
    .catch(err => {
      console.log(err);
      res.send(err);
      res.end();
    });
};

const getPriceDisparity = (req, res) => {
  const currencies = req.body.currencies || supportedCurrencies;
  _getPrices(currencies)
    .then(priceData => {
      res.send(_generateDisparityPayload(priceData));
      res.end();
    })
    .catch(err => {
      console.log(err);
      res.send(err);
      res.end();
    });
};

const _getPrices = currencies => {
  const pricePromises = [
    ...gdax.getPricePromises(currencies),
    ...bittrex.getPricePromises(currencies),
    ...gemini.getPricePromises(currencies),
    ...binance.getPricePromises(currencies)
  ];

  return promiseSettle(pricePromises)
    .then(exchangeRates => {
      const pricePayload = {};

      exchangeRates.forEach(result => {
        let exchangeData;
        if (!result.isFulfilled()) {
          console.log(`Failure fetching an exchange: ${result.reason()}`);
          return;
        } else {
          exchangeData = result.value();
        }

        const { exchange, currency, bid, ask } = exchangeData;
        if (!pricePayload[exchange]) {
          pricePayload[exchange] = {};
        }

        pricePayload[exchange][currency] = {
          bid,
          ask
        };
      });

      return pricePayload;
    })
    .catch(err => {
      throw new Error(err); // Bubble up!
    });
};

const _generateDisparityPayload = pricePayload => {
  const disparityObject = {};
  const exchanges = Object.keys(pricePayload);

  for (let i = 0; i < exchanges.length; i++) {
    const sellSide = exchanges[i];

    // Look at the other exchanges
    for (let j = 0; j < exchanges.length; j++) {
      const buySide = exchanges[j];
      if (sellSide === buySide) {
        continue;
      }

      const currencies = Object.keys(pricePayload[exchanges[i]]);
      currencies.forEach(currency => {
        if (!pricePayload[buySide][currency]) {
          // Comparison exchange doesn't support this currency, move on
          return;
        }

        const ratio = pricePayload[sellSide][currency].bid / pricePayload[buySide][currency].ask;
        const potentialPercGain = (ratio - 1) * 100;

        disparityObject[`sell_${sellSide}--buy_${buySide}--${currency}`] = {
          currency,
          potentialPercGain,
          buyExchange: buySide,
          sellExchange: sellSide
        };
      });
    }
  }

  const sortedKeys = Object.keys(disparityObject).sort((a, b) => {
    return (
      parseFloat(disparityObject[b].potentialPercGain) -
      parseFloat(disparityObject[a].potentialPercGain)
    );
  });
  const sortedDisparity = [];

  sortedKeys.forEach(key => {
    sortedDisparity.push({
      exchangePair: key,
      currency: disparityObject[key].currency,
      potentialPercGain: disparityObject[key].potentialPercGain,
      buyExchange: disparityObject[key].buyExchange,
      sellExchange: disparityObject[key].sellExchange
    });
  });

  return sortedDisparity;
};

module.exports = {
  getPrices,
  getPriceDisparity
};
