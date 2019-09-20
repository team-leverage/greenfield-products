/* eslint-disable no-param-reassign, import/order */
const { staging } = require('../knexfile');
const knex = require('knex')(staging);

// /////////////////Below are for /products/list
exports.getProductList = async function (num, cb) { // there's actually 2 params, look again later
  const productFields = [
    'product_id AS id',
    'product_name AS name',
    'slogan',
    'product_description AS description',
    'category_name AS category',
    'default_price',
  ];
  cb(await knex.select(...productFields)
    .from('products')
    .rightOuterJoin('categories', 'categories.category_id', 'products.category_id')
    .limit(num));
};
// /////////////////Below are for /products/:product_id
exports.getProductFeatures = async function (productId, cb) {
  const featureFields = [
    'feature_name AS feature',
    'feature_value AS value',
  ];
  cb(await knex.select(...featureFields)
    .from('product_feature_join')
    .where({ product_id: productId })
    .rightOuterJoin('feature_values', 'product_feature_join.feature_value_id', 'feature_values.feature_value_id')
    .rightOuterJoin('feature_names', 'feature_values.feature_name_id', 'feature_names.feature_name_id'));
};

exports.getProductInfo = async function (productId, cb) {
  const productFields = [
    'product_id AS id',
    'product_name AS name',
    'slogan',
    'product_description AS description',
    'category_name AS category',
    'default_price',
  ];
  cb(await knex.select(...productFields).from('products')
    .where({ product_id: productId })
    .rightOuterJoin('categories', 'categories.category_id', 'products.category_id'));
};
// /////////////////Below are for /products/:product_id/styles
exports.getAllStyles = async function (productId, cb) { // this is the value for the results key
  const styleFields = [
    'style_id',
    'style_name AS name',
    'original_price',
    'sale_price',
    'is_default AS default\\?',
  ];
  cb(await knex.select(...styleFields)
    .from('styles')
    .where({ product_id: productId }));
};

exports.getPhotos = async function (styleId, cb) { // this is the value for the photos subkey
  const photoFields = [
    'main_url AS url',
    'thumbnail_url',
  ];
  cb(await knex.select(...photoFields)
    .from('photos')
    .where({ style_id: styleId }));
};

exports.getSkus = async function (styleId, cb) {
  const skuFields = [
    'size_name',
    'quantity',
  ];

  const unformatResult = await knex.select(...skuFields)
    .from('skus')
    .where({ style_id: styleId })
    .rightOuterJoin('sizes', 'skus.size_id', 'sizes.size_id');
  // then reformat the query output
  cb(unformatResult.reduce((accum, skuObj) => {
    accum[skuObj.size_name] = skuObj.quantity;
    return accum;
  }, {}));
};
// /////////////////Below are for /products/:product_id/related
exports.getRelated = async function (productId, cb) {
  const unformatResult = await knex.select('related_product_id')
    .from('related_products')
    .where({ product_id: productId });
  // then reformat the query output
  cb(unformatResult.map((relatedObj) => relatedObj.related_product_id));
};
// /////////////////Below are for /cart
exports.getCart = async function (userSession, cb) {
  cb(await knex.select('*')
    .from('carts')
    .where({ user_session: userSession }));
};

exports.postToCart = async function (postData, cb) {
  cb(await knex('carts').insert({
    user_session: postData.user_session,
    product_id: postData.product_id,
    active: 1,
  }));
};
// /////////////////Below are for /interactions
exports.postInteraction = async function (postData, cb) {
  cb(await knex('interactions').insert({
    element: postData.element,
    widget: postData.widget,
    time: postData.time,
  }));
};
