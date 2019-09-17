var {staging} = require('../knexfile');
var knex = require('knex')(staging);

exports.getProductList = function (num, cb) {
  //write query for top num # of entries in product list
  //full join categories, products
  let productFields = [
    'id',
    'name',
    'slogan',
    'description',
    'category',
    'default_price',
  ];
  knex.select(...productFields).from('products').fullOuterJoin('categories', 'categories.category_id', 'products.category_id').limit(num)
  .then((err, result) => {
    cb(err, result)
  });
}

exports.getProductInfo = function (productId, cb) {
  
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