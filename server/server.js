const PORT = 3000;
const express = require('express');
const bodyParser = require('body-parser');
const db = require('./queries');
const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

db.loadProducts();

// app.get('/', db.loadProducts);

// app.get('/', (req, res) => {
//   res.json({info: 'Node.js, Express, and PostgreSQL API'})
// });

// app.get('/users', db.loadProducts);

app.listen(PORT, () => {
  console.log(`App is running on port ${PORT}`);
});