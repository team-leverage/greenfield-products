
exports.up = function (knex) {
  return Promise.all([
    knex.schema.createTable('categories', (table) => {
      table.increments('category_id').primary();
      table.string('category_name', 50);

      table.timestamps(true, true);
    }),

    knex.schema.createTable('products', (table) => {
      table.increments('product_id').primary();
      table.string('product_name', 50);
      table.string('slogan', 250);
      table.string('product_description', 1500);
      table.integer('category_id').unsigned();
      table.decimal('default_price', 12, 2);
      table.foreign('category_id').references('categories.category_id');

      table.timestamps(true, true);
    }),
  ]);
};

exports.down = function (knex) {
  return Promise.all([
    knex.schema.dropTable('products'),
    knex.schema.dropTable('categories'),
  ]);
};
