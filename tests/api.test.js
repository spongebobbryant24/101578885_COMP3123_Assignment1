const { test, before } = require('node:test');
const assert = require('node:assert/strict');
const request = require('supertest');
const jwt = require('jsonwebtoken');

process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-only-secret-12345678901234567890';
const app = require('../src/app');

before(() => {});

test('GET /health responds with JSON and HTTP 200', async () => {
  const response = await request(app).get('/health');
  assert.equal(response.status, 200);
  assert.equal(response.body.success, true);
  assert.equal(response.body.status, 'ok');
});

test('Protected GET rejects missing JWT with 401', async () => {
  const response = await request(app).get('/api/v1/emp/employees');
  assert.equal(response.status, 401);
  assert.equal(response.body.error.code, 'AUTH_REQUIRED');
});

test('Protected GET rejects invalid JWT with 401', async () => {
  const response = await request(app).get('/api/v1/emp/employees').set('Authorization', 'Bearer this.is.not.a.token');
  assert.equal(response.status, 401);
  assert.equal(response.body.error.code, 'INVALID_TOKEN');
});

test('Signup validates required fields before database access', async () => {
  const response = await request(app).post('/api/v1/user/signup').send({ email: 'invalid-address', password: 'short' });
  assert.equal(response.status, 400);
  assert.equal(response.body.error.code, 'VALIDATION_ERROR');
});

test('Signup rejects extraneous privilege field', async () => {
  const response = await request(app).post('/api/v1/user/signup').send({ username: 'alice', email: 'alice@test.test', password: 'DemoPass123!', role: 'admin' });
  assert.equal(response.status, 400);
});

test('Malformed JSON gets a JSON 400', async () => {
  const response = await request(app).post('/api/v1/user/signup').set('Content-Type', 'application/json').send('{ invalid json');
  assert.equal(response.status, 400);
  assert.equal(response.body.error.code, 'INVALID_JSON');
});

test('Unknown route returns JSON 404', async () => {
  const response = await request(app).get('/not-real');
  assert.equal(response.status, 404);
  assert.equal(response.body.error.code, 'ROUTE_NOT_FOUND');
});

test('Login requires username OR email plus password', async () => {
  const response = await request(app).post('/api/v1/user/login').send({ password: 'anyvalue' });
  assert.equal(response.status, 400);
});


test('Expired JWT is rejected with 401', async () => {
  const token = jwt.sign({ sub: '507f191e810c19729de860ea' }, process.env.JWT_SECRET, { expiresIn: -1 });
  const response = await request(app).get('/api/v1/emp/employees').set('Authorization', `Bearer ${token}`);
  assert.equal(response.status, 401);
  assert.equal(response.body.error.code, 'TOKEN_EXPIRED');
});
