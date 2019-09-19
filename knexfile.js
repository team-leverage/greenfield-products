// Update with your config settings.

module.exports = {

  development: {
    client: 'pg',
    // connection: 'postgres://localhost/greenfield',
    connection: {
      host: 'localhost',
      database: 'greenfield',
      user: 'han',
      password: 'face468a',
    },
    useNullAsDefault: true,
    pool: {
      min: 2,
      max: 100,
    },
    migrations: {
      directory: './db/migrations',
    },
    seeds: {
      directory: './db/seeds/dev',
    },
  },

  staging: {
    client: 'pg',
    // connection: 'postgres://localhost/greenfield',
    connection: {
      host: 'localhost',
      database: 'greenfield',
      user: 'han',
      password: 'face468a',
    },
    useNullAsDefault: true,
    pool: {
      min: 2,
      max: 100,
    },
    migrations: {
      directory: './db/migrations',
    },
  },

  // production: {
  //   client: 'postgresql',
  //   connection: {
  //     database: 'my_db',
  //     user:     'username',
  //     password: 'password'
  //   },
  //   pool: {
  //     min: 2,
  //     max: 10
  //   },
  //   migrations: {
  //     tableName: 'knex_migrations'
  //   }
  // },

};
