/* eslint-disable no-param-reassign */
const queries = require('./queries');
const redis = require('redis');
const redisClient = redis.createClient(6379);

function redisify(keyMakerFunction, queryFunction) {
  const redisVersion = function (req, res) {
    const key = keyMakerFunction(req);
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

const getProductListNonRedis = function (req, res, cb = () => {}) {
  const num = Number(req.params.num);
  queries.getProductList(num, (data) => {
    res.json(data);
    cb(data);
  });
};

const getProductInfoNonRedis = function (req, res, cb = () => {}) {
  const productId = Number(req.params.product_id);
  queries.getProductInfo(productId, (productInfoData) => {
    queries.getProductFeatures(productId, (featuresObj) => {
      productInfoData[0].features = featuresObj;
      res.json(productInfoData[0]);
      cb(productInfoData[0]);
    });
  });
};

const getStylesNonRedis = function (req, res, cb = () => {}) {
  const productId = Number(req.params.product_id); // NOTE: API as is has this as a STRING!! Fix???
  const styles = { product_id: productId };
  queries.getAllStyles(productId, async (results) => {
    styles.results = results;

    const stylePromises = [];

    results.forEach((styleObj) => {
      // START PARALLEL PHOTOS AND SKUS
      const styleId = styleObj.style_id;
      stylePromises.push(
        new Promise((resolvePhotos) => {
          queries.getPhotos(styleId, (photosList) => {
            styleObj.photos = photosList;
            resolvePhotos();
          });
        }),
        new Promise((resolveSkus) => {
          queries.getSkus(styleId, (skusObj) => {
            styleObj.skus = skusObj;
            resolveSkus();
          });
        }),
      );
      // END PARALLEL PHOTOS AND SKUS
    });

    try {
      await Promise.all(stylePromises);
      res.json(styles);
      cb(styles);
    } catch (err) {
      console.error('Threw an error at the Promise.all() in getStyles in controller.js');
    }
  });
};

const getRelatedNonRedis = function (req, res, cb = () => {}) {
  const productId = Number(req.params.product_id);
  queries.getRelated(productId, (data) => {
    res.json(data);
    cb(data);
  });
};

const getCartNonRedis = function (req, res, cb = () => {}) {
  const userSession = Number(req.params.user_session);
  queries.getCart(userSession, (data) => {
    res.json(data);
    cb(data);
  });
};

///////////////////////////////Exported functions below/////////////////////////////////////////

exports.getProductList = redisify(
  (req) => `/products/list/${req.params.num}`,
  getProductListNonRedis
);

exports.getProductInfo = redisify(
  (req) => `products/${req.params.product_id}`,
  getProductInfoNonRedis
);

exports.getStyles = redisify(
  (req) => `/products/${req.params.product_id}/styles`,
  getStylesNonRedis
);

exports.getRelated = redisify(
  (req) => `/products/${req.params.product_id}/related`,
  getRelatedNonRedis
);

exports.getCart = redisify(
  (req) => `/cart/${req.params.user_session}`,
  getCartNonRedis
);

exports.postToCart = function (req, res, cb = () => {}) {
  const postData = {
    user_session: req.body.user_session,
    product_id: req.body.product_id,
  };
  queries.postToCart(postData, (data) => {
    res.json(data);
    cb(data);
  });
};

exports.postInteraction = function (req, res, cb = () => {}) {
  const postData = {
    element: req.body.element,
    widget: req.body.widget,
    time: req.body.time,
  };
  queries.postInteraction(postData, (data) => {
    res.json(data);
    cb(data);
  });
};
