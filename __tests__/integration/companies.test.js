process.env.NODE_ENV = "test"

const request = require("supertest");

const app = require("../app");
const db = require("../db");

let company;

beforeEach(async () => {
  let result = await db.query(`
    INSERT INTO comapnies (handle, name, num_employees, logo_url)
    VALUES (apple, apple inc, 100000, https://apple.com/image)
    RETURNING handle, name, num_employees, logo_url
  `)

  company = result.rows[0];
})

