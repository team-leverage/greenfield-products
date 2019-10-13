// Update with your config settings.
const serverUrl = 'localhost';

module.exports = {

  development: {
    client: 'pg',
    // connection: 'postgres://localhost/greenfield',
    connection: {
      host: serverUrl,
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
      host: serverUrl,
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

  production: {
    client: 'pg',
    connection: {
      host: serverUrl,
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

};
