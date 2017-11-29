const fetch = require('node-fetch');

class FiatConverter {
  init() {
    this.conversionRates = {};
    this.supportedCurrencies = ['KRW'];
    this.baseApi = 'https://api.fixer.io/latest?base=USD';

    this.fetchPromise = this.fetchRates();
  }

  fetchRates() {
    return fetch(this.baseApi)
      .then(res => {
        if (!res.ok) {
          throw new Error('Failed to fetch rates');
        }
        return res.json();
      })
      .then(payload => {
        this.supportedCurrencies.forEach(currency => {
          this.conversionRates[currency] = payload.rates[currency];
        });

        return this.conversionRates;
      })
      .catch(err => {
        throw err;
      });
  }

  convert(foreignPrice, fromCurrency) {
    return this.fetchPromise
      .then(conversionRates => {
        return foreignPrice / conversionRates[fromCurrency];
      })
      .catch(err => {
        throw err;
      });
  }
}

module.exports = new FiatConverter();
