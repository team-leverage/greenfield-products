const PORT = 3000;
const path = require('path');
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
// require('newrelic');

const {
  getProductList,
  getProductInfo,
  getStyles,
  getRelated,
  getCart,
  postToCart,
  postInteraction,
} = require('./controllers');

const redis = require('redis');
const redisClient = redis.createClient(6379);

function redisify (key, queryFunction) {
  const redisVersion = function (req, res) {
    redisClient.get(key, (err, result) => {
      if (result) {
        res.send(JSON.parse(result));
      } else {
        queryFunction(req, res, (data) => {
          redisClient.set(key, JSON.stringify(data));
        })
      }
    });
  }
  return redisVersion;
}

const app = express();
app.use(cors());
app.use(bodyParser.json());
// app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, '../public')));

app.get('/products/list/', (req, res) => {
  res.redirect('/products/list/5');
});
app.get('/products/list/:num', getProductList);
app.get('/products/:product_id', getProductInfo);
app.get('/products/:product_id/styles', getStyles);
app.get('/products/:product_id/related', getRelated);
app.get('/cart/:user_session', getCart);
app.post('/cart', postToCart);
app.post('/interactions', postInteraction);

app.listen(PORT, () => {
  console.log(`App is running on port ${PORT}`);
});
