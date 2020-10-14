const request = require('supertest');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

const app = require('../../app');
const db = require('../../db');

const DATA = {};

async function beforeEachHook(DATA) {
  try {
    //create user
    const hashedPassword = await bcrypt.hash('hello', 1);
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

    //store token and username on global data
    DATA.userToken = response.body.token;
    DATA.currentUsername = jwt.decode(DATA.userToken).username;

    //create company
    const result = await db.query(
      `INSERT INTO companies (handle, name, num_employees)
       VALUES ($1, $2, $3) RETURNING *`
       ,['terry', 'Terry inc', 5000]);

    //store created company on global data
    DATA.currentCompany = result.rows[0];

    // create job
    const newJob = await db.query(`
      INSERT INTO jobs (title, salary, company_handle)
      VALUES ('Full Stack Engineer', 120000, $1) RETURNING *`
      ,[DATA.currentCompany.handle]);

    // add to global data
    DATA.jobId = newJob.rows[0].id;

  } catch (e) {
    console.error(e);
  }
}

async function afterEachHook() {
  try {
    await db.query('DELETE FROM jobs');
    await db.query('DELETE FROM users');
    await db.query('DELETE FROM companies');
  } catch (e) {
    console.error(e);
  }
}

async function afterAllHook() {
  try {
    await db.end();
  } catch (e) {
    console.error(e);
  }
}

module.exports = {
  DATA,
  beforeEachHook,
  afterEachHook,
  afterAllHook
}