CREATE INDEX category_idx ON products (category_id);
CREATE INDEX feature_name_idx ON feature_values (feature_name_id);
CREATE INDEX pfj_product_idx ON product_feature_join (product_id);
CREATE INDEX pfj_feature_value_idx ON product_feature_join (feature_value_id);
CREATE INDEX related1_product_idx ON related_products (product_id);
CREATE INDEX related2_product_idx ON related_products (related_product_id);
CREATE INDEX styles_product_idx ON styles (product_id);
CREATE INDEX sku_style_idx ON skus (style_id);
CREATE INDEX sku_size_idx ON skus (size_id);
CREATE INDEX photo_style_idx ON photos (style_id);