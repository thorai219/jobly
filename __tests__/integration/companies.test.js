const request = require("supertest");
const app = require("../../app");
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../../db');

let TEST_DATA = {};

beforeEach(async function() {
  const hashedPassword = await bcrypt.hash('hello', 10);
  await db.query(`
    INSERT INTO users (username, password, first_name, last_name, email, is_admin)
    VALUES ('Terry', $1, 'Terry', 'Lee', 'Terry@test.com', true)`
    ,[hashedPassword]);

  // login a user to get token
  const response = await request(app)
    .post('/login')
    .send({
      username: 'Terry',
      password: 'hello'
    });
  TEST_DATA.userToken = response.body.token;
  TEST_DATA.username = jwt.decode(TEST_DATA.userToken).username;
});

describe("/company post", function () {
  test("create a company", async function () {
    const result = await request(app)
    .post("/company")
    .send({
      handle: "apple",
      name: "Apple Inc",
      _token: TEST_DATA.userToken
    });
    console.log(result.statusCode);
    expect(result.statusCode).toEqual(201);
    expect(response.body.company).toHaveProperty('handle');
  });
});

afterEach(async function() {
  try {
    await db.query('DELETE FROM jobs');
    await db.query('DELETE FROM users');
    await db.query('DELETE FROM companies');
  } catch (e) {
    console.error(e);
  }
});

afterAll(async function() {
  try {
    await db.end();
  } catch (e) {
    console.error(e);
  }
});

