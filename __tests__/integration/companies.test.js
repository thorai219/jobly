const request = require("supertest");

const app = require("../../app");
const { DATA, afterEachHook, beforeEachHook, afterAllHook } = require('./config');

beforeEach(async () => {
  await beforeEachHook(DATA)
});

describe("/company post", () => {
  test("create a company", async () => {
    const result = await request(app)
    .post("/company")
    .send({
      handle: "apple",
      name: "Apple Inc",
      _token: DATA.userToken
    });
    console.log(result.statusCode);
    expect(result.statusCode).toEqual(201);
    expect(response.body.company).toHaveProperty('handle');
  });
});

afterEach(async function() {
  await afterEachHook();
});

afterAll(async function() {
  await afterAllHook();
});

