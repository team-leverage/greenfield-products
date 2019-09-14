CREATE DATABASE greenfield;

\c greenfield;

CREATE TABLE categories (
  category_id serial PRIMARY KEY,
  category_name varchar(50) UNIQUE
);

CREATE TABLE products (
  product_id serial PRIMARY KEY,
  product_name varchar(50),
  slogan varchar(250),
  product_description varchar(1500),
  category_id int REFERENCES categories(category_id),
  default_price numeric(12, 2) DEFAULT 0.00,
  CONSTRAINT unique_products UNIQUE (product_name, slogan, product_description)
);

CREATE TABLE feature_names (
  feature_name_id serial PRIMARY KEY,
  feature_name varchar(50) UNIQUE
);

CREATE TABLE feature_values (
  feature_value_id serial PRIMARY KEY,
  feature_name_id int REFERENCES feature_names(feature_name_id),
  feature_value varchar(50),
  CONSTRAINT unique_features UNIQUE (feature_name_id, feature_value)
);

CREATE TABLE product_feature_join (
  feature_product_id serial PRIMARY KEY,
  product_id int REFERENCES products(product_id) ,
  feature_value_id int REFERENCES feature_values(feature_value_id),
  CONSTRAINT unique_features_product UNIQUE (product_id, feature_value_id)
);

CREATE TABLE related_products (
  relation_id serial PRIMARY KEY,
  product_id int REFERENCES products(product_id),
  related_product_id int REFERENCES products(product_id),
  CONSTRAINT unique_related_products UNIQUE (product_id, related_product_id)
);

CREATE TABLE styles (
  style_id serial PRIMARY KEY,
  style_name varchar(50),
  original_price numeric(12, 2) DEFAULT 0.00,
  sale_price numeric(12, 2) DEFAULT 0.00,
  is_default bit,
  product_id int REFERENCES products(product_id),
  -- CONSTRAINT unique_styles UNIQUE (style_name, product_id)
);

CREATE TABLE sizes (
  size_id serial PRIMARY KEY,
  size_name varchar(20) UNIQUE
);

CREATE TABLE skus (
  sku_id serial PRIMARY KEY,
  style_id int REFERENCES styles(style_id),
  size_id int REFERENCES sizes(size_id),
  quantity int DEFAULT 0,
  CONSTRAINT unique_skus UNIQUE (size_id, style_id)
);

CREATE TABLE photos (
  photo_id serial PRIMARY KEY,
  style_id int REFERENCES styles(style_id),
  main_url varchar(1500),
  thumbnail_url varchar(1500),
  CONSTRAINT unique_photos UNIQUE (style_id, main_url, thumbnail_url)
);
