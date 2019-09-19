
exports.up = function (knex) {
  return Promise.all([
    knex.schema.createTable('feature_names', (table) => {
      table.increments('feature_name_id').primary();
      table.string('feature_name', 50);

      table.timestamps(true, true);
    }),

    knex.schema.createTable('feature_values', (table) => {
      table.increments('feature_value_id').primary();
      table.integer('feature_name_id').unsigned();
      table.integer('feature_value_id').unsigned();
      table.foreign('feature_name_id').references('feature_names.feature_name_id');

      table.timestamps(true, true);
    }),

    knex.schema.createTable('product_feature_join', (table) => {
      table.increments('feature_product_id').primary();
      table.integer('product_id').unsigned();
      table.integer('feature_value_id').unsigned();
      table.foreign('product_id').references('products.product_id');
      table.foreign('feature_value_id').references('feature_values.feature_value_id');
    }),
  ]);
};

exports.down = function (knex) {
  knex.schema.dropTable('product_feature_join');
  knex.schema.dropTable('feature_values');
  knex.schema.dropTable('feature_names');
};
