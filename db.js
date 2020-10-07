/** Database setup for jobly. */

const { Client } = require("pg");
const { DB_URI } = require("./config");

const { Client } = require('pg');

const db = new Client({
  user: 'postgres',
  host: 'localhost',
  database: DB_URI,
  password: '1234',
  port: 5432
})

db.connect();

module.exports = db;