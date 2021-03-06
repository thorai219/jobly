const request = require("supertest");
const bcrypt = require("bcrypt");
const app = require("../../app");
const db = require("../../db");

var TEST = {}

beforeAll(async (done) => {
  try {
    const pwd = await bcrypt.hash('test', 1)
    await db.query(`
      INSERT INTO users (username, password, email, first_name, last_name, is_admin)
      VALUES ('test', $1, 'test@test.com', 'test', 'tester', true)
    `, [pwd])
    await db.query(`
      INSERT INTO companies (handle, name)
      VALUES ('aaa', 'AAA Company')
    `)
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

describe('post /companies', () => {
  test('should create a company', async () => {
    try {
      return await request(app)
        .post('/companies')
        .send({
          handle: 'bbb',
          name: 'BBB Company',
          _token: TEST.token
        })
        .then((res) => {
          expect(res.statusCode).toEqual(201)
        })
    } catch (err) {
      console.log(err)
    }
  })

  test('avoid posting duplicate companies', async () => {
    try {
      return await request(app)
        .post('/companies')
        .send({
          handle: 'aaa',
          name: 'AAA Company',
          _token: TEST.token
        })
        .then((res) => {
          expect(res.statusCode).toBe(400)
        })
    } catch (err) {
      console.log(err)
    }
  })
})

describe('get /companies', () => {
  test('gets list of companies', async () => {
    try {
      return await request(app)
        .get('/companies')
        .send({
          _token: TEST.token
        })
        .then((res) => {
          expect(res.statusCode).toBe(200)
        })
    } catch (err) {
      console.log(err)
    }
  })

  test('gets one company', async () => {
    try {
      return await request(app)
        .get('/companies/aaa')
        .send({
          _token: TEST.token
        })
        .then((res) => {
          expect(res.body.company.name).toBe('AAA Company')
        })
    } catch (err) {
      console.log(err)
    }
  })
})

describe('patch /companies', () => {
  test('should update a company', async () => {
    try {
      return await request(app)
        .patch('/companies/aaa')
        .send({
          name: 'AAA Inc',
          _token: TEST.token
        })
        .then((res) => {
          expect(res.statusCode).toBe(200)
          expect(res.body.company.name).toBe('AAA Inc')
        })
    } catch (err) {
      console.log(err)
    }
  })
})

describe('delete /companies', () => {
  test('delete a company', async () => {
    try {
      return await request(app)
        .delete('/companies/bbb')
        .send({
          _token: TEST.token
        })
        .then((res) => {
          expect(res.statusCode).toBe(200)
        })
    } catch (err) {
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