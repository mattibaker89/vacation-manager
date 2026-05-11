const { Client } = require('pg');
require('dotenv').config({ path: `${__dirname}/../../.env.test` });

// Creates the test database if it doesn't exist, before any test suite runs.
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
  const { rowCount } = await client.query(
    'SELECT 1 FROM pg_database WHERE datname = $1',
    [dbName],
  );
  if (!rowCount) {
    await client.query(`CREATE DATABASE "${dbName}"`);
    console.log(`Created database: ${dbName}`);
  }
  await client.end();
};
