const queries = require('./queries');

exports.getProductList = function (req, res) {
  const num = Number(req.params.num);
  queries.getProductList(num, (data) => {
    res.json(data);
  });
};

exports.getProductInfo = function (req, res) {
  const productId = Number(req.params.product_id);
  queries.getProductInfo(productId, (productInfoData) => {
    queries.getProductFeatures(productId, (featuresObj) => {
      productInfoData[0].features = featuresObj;
      res.json(productInfoData[0]);
    });
  });
};

exports.getStyles = function (req, res) {
  const productId = Number(req.params.product_id); // NOTE: API as is has this as a STRING!! Fix???
  const styles = { product_id: productId };
  queries.getAllStyles(productId, (results) => {
    styles.results = results;

    const stylePromises = [];

    results.forEach((styleObj) => {
      stylePromises.push(new Promise((resolve) => {
        const styleId = styleObj.style_id;
        queries.getPhotos(styleId, (photosList) => {
          styleObj.photos = photosList;
          queries.getSkus(styleId, (skusObj) => {
            styleObj.skus = skusObj;
            resolve();
          });
        });
      }));
    });

    Promise.all(stylePromises).then(() => res.json(styles));
  });
};

exports.getRelated = function (req, res) {
  const productId = Number(req.params.product_id);
  queries.getRelated(productId, (data) => {
    res.json(data);
  });
};

exports.getCart = function (req, res) {
  const userSession = Number(req.params.user_session);
  queries.getCart(userSession, (data) => {
    res.json(data);
  });
};

exports.postToCart = function (req, res) {
  const postData = {
    user_session: req.body.user_session,
    product_id: req.body.product_id,
  };
  queries.postToCart(postData, (data) => {
    res.json(data);
  });
};

exports.postInteraction = function (req, res) {
  const postData = {
    element: req.body.element,
    widget: req.body.widget,
    time: req.body.time,
  };
  queries.postInteraction(postData, (data) => {
    res.json(data);
  });
};
