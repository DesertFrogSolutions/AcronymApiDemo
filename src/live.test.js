if (!process.env.API_USER) {
  process.env.API_USER = 'username';
}
if (!process.env.API_PASSWORD) {
  process.env.API_PASSWORD = 'password';
}

// assertions
const chai = require('chai');
const expect = chai.expect;
const assert = chai.assert;

// request testing library
const request = require('supertest');
// include server from index.js and the objects we'll mock
const server = require('./index');

describe('test for GET endpoint', () => {
  afterEach((done) => {
    server.close(done);
  });
  it('gets a page of acronyms', (done) => {
    request(server)
      .get('/acronym')
      .expect(200)
      .then((res) => {
        // do something with response
        // console.log(res);
        assert.isOk(res.headers?.link);
        assert.isOk(res.body);
        assert.isAtLeast(res.body.length, resultRows.length);
        console.log(res.body);
        return done();
      }).catch((err) => {
        console.log(err);
        done(err);
      });
  })
});

describe('POST /acronym', () => {
  // constants for request parameters
  const name = 'TESTACRONYM';
  const description = 'This acronym has a description';
  afterEach((done) => {
    server.close(done);
  });
  it('adds an acronym to the DB', (done) => {
    request(server)
      .post('/acronym')
      .auth(process.env.API_USER, process.env.API_PASSWORD)
      .send({name: name, description: description})
      .set('Accept', 'application/json')
      .expect(200)
      .then((res) => {
        // do something with response
        return done();
      }).catch((err) => {
        console.log(err);
        done(err);
      });
  });
});

describe('PUT /acronym/:acronym', () => {
  // constants for request parameters
  const oldName = 'TESTACRONYM';
  const oldDescription = 'This acronym has a description';
  const newName = 'NEWTESTACRONYM';
  const newDescription = 'This acronym has a new description';

  // stubs stored into these variables
  afterEach((done) => {
    server.close(done);
  });
    it('rejects without authentication', (done) => {
    request(server)
      .put(`/acronym/${oldName}`)
      .send({name: newName, description: newDescription})
      .set('Accept', 'application/json')
      .expect(401)
      .then((res) => {
        // do something with response
        return done();
      }).catch((err) => {
        console.log(err);
        done(err);
      });
    });
});

describe('DELETE /acronym/:acronym', () => {
  // constants for request parameters
  const name = 'TESTACRONYM';
  const description = 'This acronym has a description';

  afterEach((done) => {
    server.close(done);
  });
  it('adds an acronym to the DB and then deletes it', (done) => {
    request(server)
      .post('/acronym')
      .auth(process.env.API_USER, process.env.API_PASSWORD)
      .send({name: name, description: description})
      .set('Accept', 'application/json')
      .expect(200);

    request(server)
      .delete(`/acronym/${name}`)
      .auth(process.env.API_USER, process.env.API_PASSWORD)
      .expect(200)
      .then((res) => {
        // do something with response
        return done();
      }).catch((err) => {
        console.log(err);
        done(err);
      });
  });
});
