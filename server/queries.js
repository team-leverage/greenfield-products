const { staging } = require('../knexfile');
const knex = require('knex')(staging);

// /////////////////Below are for /products/list
exports.getProductList = function (num, cb) { // there's actually 2 params, look at this again later
  const productFields = [
    'product_id AS id',
    'product_name AS name',
    'slogan',
    'product_description AS description',
    'category_name AS category',
    'default_price',
  ];
  knex.select(...productFields).from('products')
    .rightOuterJoin('categories', 'categories.category_id', 'products.category_id').limit(num)
    .then((result) => {
      cb(result);
    });
};
// /////////////////Below are for /products/:product_id
exports.getProductFeatures = function (productId, cb) {
  const featureFields = [
    'feature_name AS feature', 
    'feature_value AS value'
  ];
  knex.select(...featureFields).from('product_feature_join').where({ product_id: productId })
    .rightOuterJoin('feature_values', 'product_feature_join.feature_value_id', 'feature_values.feature_value_id')
    .rightOuterJoin('feature_names', 'feature_values.feature_name_id', 'feature_names.feature_name_id')
    .then((result) => {
      cb(result);
    });
};

exports.getProductInfo = function (productId, cb) {
  const productFields = [
    'product_id AS id',
    'product_name AS name',
    'slogan',
    'product_description AS description',
    'category_name AS category',
    'default_price',
  ];
  knex.select(...productFields).from('products').where({ product_id: productId })
    .rightOuterJoin('categories', 'categories.category_id', 'products.category_id')
    .then((result) => {
      cb(result);
    });
};
// /////////////////Below are for /products/:product_id/styles
exports.getAllStyles = function (productId, cb) { // this is the value for the results key
  const styleFields = [
    'style_id',
    'style_name AS name',
    'original_price',
    'sale_price',
    'is_default AS default\\?',
  ];
  knex.select(...styleFields).from('styles').where({ product_id: productId })
    .then((result) => {
      cb(result);
    });
};

exports.getPhotos = function (styleId, cb) { // this is the value for the photos subkey
  const photoFields = [
    'main_url AS url',
    'thumbnail_url',
  ];
  knex.select(...photoFields).from('photos').where({ style_id: styleId })
    .then((result) => {
      cb(result);
    });
};

exports.getSkus = function (styleId, cb) {
  const skuFields = [
    'size_name',
    'quantity',
  ];
  knex.select(...skuFields).from('skus').where({ style_id: styleId })
    .rightOuterJoin('sizes', 'skus.size_id', 'sizes.size_id')
    .then((unformatResult) => unformatResult.reduce((accum, skuObj) => {
      accum[skuObj.size_name] = skuObj.quantity;
      return accum;
    }, {}))
    .then((result) => {
      cb(result);
    });
};
// /////////////////Below are for /products/:product_id/related
exports.getRelated = function (productId, cb) {
  knex.select('related_product_id').from('related_products').where({ product_id: productId })
    .then((unformatResult) => unformatResult.map((relatedObj) => relatedObj.related_product_id))
    .then((result) => {
      cb(result);
    });
};
// /////////////////Below are for /cart
exports.getCart = function (userSession, cb) {
  knex.select('*').from('carts').where({ user_session: userSession })
    .then((result) => {
      cb(result);
    });
};

exports.postToCart = function (postData, cb) {
  knex('carts').insert({
    user_session: postData.user_session,
    product_id: postData.product_id,
    active: 1,
  })
    .then((result) => {
      cb(result);
    });
};
// /////////////////Below are for /interactions
exports.postInteraction = function (postData, cb) {
  knex('interactions').insert({
    element: postData.element,
    widget: postData.widget,
    time: postData.time,
  })
    .then((result) => {
      cb(result);
    });
};
