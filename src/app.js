const express = require('express');
const app = express();
const bodyParser = require('body-parser');

const port = process.env.PORT || 8080;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.listen(port);

console.log('RESTful API server started on: ' + port);

// More graceful fallback
app.use((req, res) => {
  res.status(404).send({ url: req.originalUrl + ' not found' });
});
