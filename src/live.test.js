if (!process.env?.API_USER) {
  process.env.API_USER = 'username';
}
if (!process.env?.API_PASSWORD) {
  process.env.API_PASSWORD = 'password';
}

// assertions
const chai = require('chai');
const expect = chai.expect;
const assert = chai.assert;

// request testing library
const request = require('supertest');
// include server from index.js and the objects we'll mock
// const server = require('./index');
