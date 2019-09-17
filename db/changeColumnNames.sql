-- This file is to alter table field names
-- This is specifically for optimizing the Project Greenfield API
-- (I preferred previously named fields)

ALTER TABLE categories RENAME COLUMN category_name TO category;
ALTER TABLE products RENAME COLUMN product_id TO id;
ALTER TABLE products RENAME COLUMN product_description TO description;
ALTER TABLE products RENAME COLUMN product_name TO name;