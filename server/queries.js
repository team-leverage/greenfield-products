var {staging} = require('../knexfile');
var knex = require('knex')(staging);

///////////////////
exports.getProductList = function (num, cb) { // there's actually 2 params, look at this again later
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
    cb(result);
  });
}
///////////////////
exports.getProductFeatures = function (productId, cb) {
  let featureFields = ['feature', 'value'];
  knex.select(...featureFields).from('product_feature_join').where({product_id: productId})
    .fullOuterJoin('feature_values', 'product_feature_join.feature_value_id', 'feature_values.feature_value_id')
    .fullOuterJoin('feature_names', 'feature_values.feature_name_id', 'feature_names.feature_name_id')
  .then((result) => {
    cb(result);
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
    cb(result);
  })
}
///////////////////
exports.getAllStyles = function (productId, cb) { // this is the value for the results key
  let styleFields = [
    'style_id',
    'name',
    'original_price',
    'sale_price',
    'is_default'
  ];
  knex.select(...styleFields).from('styles').where({product_id: productId})
  .then((result) => {
    cb(result);
  })
}

exports.getPhotos = function (styleId, cb) { // this is the value for the photos subkey
  let photoFields = [
    'main_url',
    'thumbnail_url'
  ];
  knex.select(...photoFields).from('photos').where({style_id: styleId})
  .then((result) => {
    cb(result);
  })
}

exports.getSkus = function(styleId, cb) {
  let skuFields = [
    'size_name',
    'quantity'
  ];
  knex.select(...skuFields).from('skus').where({style_id: styleId})
    .fullOuterJoin('sizes', 'skus.size_id', 'sizes.size_id')
  .then((unformattedResult) => {
    return unformattedResult.reduce((accum, skuObj) => {
      accum[skuObj.size_name] = skuObj.quantity;
      return accum;
    }, {})
  })
  .then((result) => {
    cb(result);
  })
}
///////////////////
exports.getRelated = function (productId, cb) {
  knex.select('related_product_id').from('related_products').where({product_id: productId})
  .then((unformattedResult) => {
    return unformattedResult.map((relatedObj) => {
      return relatedObj.related_product_id;
    })
  })
  .then((result) => {
    cb(result);
  });
}
///////////////////
exports.getCart = function (userSession, cb) {
  knex.select('*').from('carts').where({user_session: userSession})
  .then((result) => {
    cb(result);
  });
}

exports.postToCart = function (postData, cb) {
  knex('carts').insert({
    user_session: postData.user_session,
    product_id: postData.product_id,
    active: 1
  })
  .then((result) => {
    cb(result);
  });
}
///////////////////
exports.postInteraction = function (postData, cb) {
  knex('interactions').insert({
    element: postData.element,
    widget: postData.widget,
    time: postData.time
  })
  .then((result) => {
    cb(result);
  });
}