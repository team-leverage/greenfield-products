CREATE DATABASE greenfield;

USE greenfield;

CREATE TABLE categories (
  category_id int NOT NULL AUTO_INCREMENT,
  category_name varchar(50),
  PRIMARY KEY (id)
);

CREATE TABLE products (
  product_id int NOT NULL AUTO_INCREMENT,
  product_name varchar(50),
  slogan varchar(250),
  product_description varchar(1500),
  category_id int NOT NULL,
  default_price numeric(12, 2) DEFAULT 0.00
  PRIMARY KEY (product_id),
  FOREIGN KEY (category_id) REFERENCES categories(category_id)
);

CREATE TABLE feature_names (
  feature_name_id int NOT NULL AUTO_INCREMENT,
  feature_name varchar(50),
  PRIMARY KEY (feature_name_id)
);

CREATE TABLE feature_values (
  feature_value_id int NOT NULL AUTO_INCREMENT,
  feature_name_id int NOT NULL
  feature_value varchar(50),
  PRIMARY KEY (feature_value_id),
  FOREIGN KEY (feature_name_id) REFERENCES feature_names(feature_name_id)
);

CREATE TABLE product_feature_join (
  feature_product_id int NOT NULL AUTO_INCREMENT,
  product_id int NOT NULL
  feature_value_id int NOT NULL
  PRIMARY KEY (feature_product_id),
  FOREIGN KEY (feature_value_id) REFERENCES feature_values(feature_value_id),
  FOREIGN KEY (product_id) REFERENCES products(product_id) 
);

CREATE TABLE related_products (
  relation_id int NOT NULL AUTO_INCREMENT,
  product_id int NOT NULL
  related_product_id int NOT NULL
  PRIMARY KEY (relation_id),
  FOREIGN KEY (product_id) REFERENCES products(product_id),
  FOREIGN KEY (related_product_id) REFERENCES products(product_id)
);

CREATE TABLE styles (
  style_id int NOT NULL AUTO_INCREMENT,
  style_name varchar(50),
  original_price numeric(12, 2) DEFAULT 0.00,
  sale_price numeric(12, 2) DEFAULT 0.00,
  is_default bit DEFAULT 0,
  product_id int NOT NULL,
  PRIMARY KEY (style_id),
  FOREIGN KEY (product_id) REFERENCES products(product_id)
);

CREATE TABLE sizes (
  sku_id int NOT NULL AUTO_INCREMENT,
  style_id int NOT NULL,
  size_name varchar(10),
  quantity int DEFAULT 0
  PRIMARY KEY (sku_id),
  FOREIGN KEY (style_id) REFERENCES styles(style_id)
);

CREATE TABLE photos (
  photo_id int NOT NULL AUTO_INCREMENT,
  style_id int NOT NULL
  main_url varchar(1500),
  thumbnail_url varchar(1500),
  PRIMARY KEY (photo_id),
  FOREIGN KEY (style_id) REFERENCES styles(style_id)
);
