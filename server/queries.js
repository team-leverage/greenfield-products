var {staging} = require('../knexfile');
var knex = require('knex')(staging);

exports.getProductList = function (num, cb) {
  let productFields = [
    'id',
    'name',
    'slogan',
    'description',
    'category',
    'default_price',
  ];
  knex.select(...productFields).from('products').fullOuterJoin('categories', 'categories.category_id', 'products.category_id').limit(num)
  .then((result) => {
    cb(result)
  });
}

exports.getProductFeatures = function (productId, cb) {
  let featureFields = ['feature', 'value'];
  knex.select(...featureFields).from('product_feature_join').where({product_id: productId})
    .fullOuterJoin('feature_values', 'product_feature_join.feature_value_id', 'feature_values.feature_value_id')
    .fullOuterJoin('feature_names', 'feature_values.feature_name_id', 'feature_names.feature_name_id')
  .then((result) => {
    cb(result)
  })
}

exports.getProductInfo = function (productId, cb) {
  let productFields = [
    'id',
    'name',
    'slogan',
    'description',
    'category',
    'default_price',
  ];
  knex.select(...productFields).from('products').where({id: productId})
    .fullOuterJoin('categories', 'categories.category_id', 'products.category_id')
  .then((result) => {
    cb(result)
  })
}

exports.getStyles = function (productId, cb) {

}

exports.getRelated = function (productId, cb) {

}

exports.getCart = function (userSession, cb) {

}

exports.postToCart = function (postData, cb) {

}

exports.postInteraction = function (postData, cb) {

}