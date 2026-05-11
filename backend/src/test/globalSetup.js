const { Client } = require('pg');
require('dotenv').config({ path: `${__dirname}/../../.env.test` });

// Drops and recreates the test database before every test run to guarantee a clean slate.
// This prevents stale table state from causing TypeORM synchronize conflicts.
module.exports = async () => {
  const dbName = process.env.DB_NAME;
  const client = new Client({
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT) || 5432,
    user: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || '',
    database: 'postgres',
  });
  await client.connect();
  await client.query(`DROP DATABASE IF EXISTS "${dbName}"`);
  await client.query(`CREATE DATABASE "${dbName}"`);
  await client.end();
};
