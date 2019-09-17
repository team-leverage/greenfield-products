const PORT = 3000;
const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');

const {
  getProductList,
  getProductInfo,
  getStyles,
  getRelated,
  getCart,
  postToCart,
  postInteraction
} = require('./controllers');

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, '../public')));

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
