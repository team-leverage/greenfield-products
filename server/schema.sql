CREATE DATABASE greenfield;

\c greenfield;

CREATE TABLE categories (
  category_id serial PRIMARY KEY,
  category_name varchar(50)
);

CREATE TABLE products (
  product_id serial PRIMARY KEY,
  product_name varchar(50),
  slogan varchar(250),
  product_description varchar(1500),
  category_id int REFERENCES categories(category_id),
  default_price numeric(12, 2) DEFAULT 0.00
  -- FOREIGN KEY (category_id) 
);

CREATE TABLE feature_names (
  feature_name_id serial PRIMARY KEY,
  feature_name varchar(50)
);

CREATE TABLE feature_values (
  feature_value_id serial PRIMARY KEY,
  feature_name_id int REFERENCES feature_names(feature_name_id),
  feature_value varchar(50)
  -- FOREIGN KEY (feature_name_id) 
);

CREATE TABLE product_feature_join (
  feature_product_id serial PRIMARY KEY,
  product_id int REFERENCES products(product_id) ,
  feature_value_id int REFERENCES feature_values(feature_value_id)
  -- FOREIGN KEY (feature_value_id) ,
  -- FOREIGN KEY (product_id) 
);

CREATE TABLE related_products (
  relation_id serial PRIMARY KEY,
  product_id int REFERENCES products(product_id),
  related_product_id int REFERENCES products(product_id)
  -- FOREIGN KEY (product_id) ,
  -- FOREIGN KEY (related_product_id) 
);

CREATE TABLE styles (
  style_id serial PRIMARY KEY,
  style_name varchar(50),
  original_price numeric(12, 2) DEFAULT 0.00,
  sale_price numeric(12, 2) DEFAULT 0.00,
  is_default bit,
  product_id int REFERENCES products(product_id)
  -- FOREIGN KEY (product_id) 
);

CREATE TABLE sizes (
  sku_id serial PRIMARY KEY,
  style_id int REFERENCES styles(style_id),
  size_name varchar(10),
  quantity int DEFAULT 0
  -- FOREIGN KEY (style_id) 
);

CREATE TABLE photos (
  photo_id serial PRIMARY KEY,
  style_id int REFERENCES styles(style_id),
  main_url varchar(1500),
  thumbnail_url varchar(1500)
  -- FOREIGN KEY (style_id) 
);
