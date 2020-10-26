const request = require("supertest");
const bcrypt = require("bcrypt");
const app = require("../../app");
const db = require("../../db");

var TEST = {};

beforeAll(async (done) => {
  try {
    const pwd = await bcrypt.hash('test', 1)
    await db.query(`
      INSERT INTO users (username, password, email, first_name, last_name, is_admin)
      VALUES ('test', $1, 'test@test.com', 'test', 'tester', true)
    `, [pwd])
    return await request(app)
      .post('/login')
      .send({
        username: 'test',
        password: 'test'
      })
      .then((res) => {
        expect(res.statusCode).toBe(200)
        TEST.token = res.body.token;
        done()
      })
  } catch (err) {
    console.log(err)
  }
})

describe('post /users', () => {
  test('able to register', async () => {
    try{
      return await request(app)
        .post('/users')
        .send({
          username: 'hello',
          password: 'hello123',
          email: 'hello@test.com'
        })
        .then((res) => {
          expect(res.statusCode).toEqual(201)
        })
    }catch(err){
      console.log(err)
    }
  })
})

describe('post /login', () => {
  test('able to login', async () => {
    try {
      return await request(app)
        .post('/login')
        .send({
          username: 'hello',
          password: 'hello123'
        })
        .then((res) => {
          expect(res.statusCode).toEqual(200)
        })
    } catch(err) {
      console.log(err)
    }
  })
})

describe('get /users', () => {
  test('able to get list of users', async () => {
    try {
      return await request(app)
        .get('/users')
        .send({
          _token: TEST.token
        })
        .then((res) => {
          expect(res.statusCode).toEqual(200)
        })
    } catch (err) {
      console.log(err)
    }
  })
  test('able to get one user', async () => {
    try {
      return await request(app)
        .get('/users/test')
        .send({
          _token: TEST.token
        })
        .then((res) => {
          expect(res.statusCode).toEqual(200)
        })
    } catch(err) {
      console.log(err)
    }
  })
})

describe('patch /users', () => {
  test('update a user', async () => {
    try {
      return await request(app)
        .patch('/users/test')
        .send({
          email: 'test12222@gmail.com',
          _token: TEST.token
        })
        .then((res) => {
          expect(res.statusCode).toEqual(200)
        })
    } catch(err) {
      console.log(err)
    }
  })
})

describe('delete /users', () => {
  test('delete a user', async () => {
    try {
      return await request(app)
        .delete('/users/test')
        .send({
          _token: TEST.token
        })
        .then((res) => {
          expect(res.statusCode).toEqual(200)
        })
    } catch(err) {
      console.log(err)
    }
  })
})

afterAll(async () => {
  try {
    await db.query(`DELETE FROM users`)
    await db.query(`DELETE FROM companies`)
    await db.end()
  } catch (err) {
    console.log(err)
  }
})