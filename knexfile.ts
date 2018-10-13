const db = {
  client: 'pg',
  connection: process.env.DATABASE_URL,
  migrations: {
    directory: './src/migrations',
    tableName: 'migrations',
  },
  seeds: {
    directory: './src/seeds',
  },
}

module.exports = {
  test: db,
  development: db,
  staging: db,
  production: db,
}
