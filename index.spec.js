if (!process.env?.API_USER) {
  process.env.API_USER = 'username';
}
if (!process.env?.API_PASSWORD) {
  process.env.API_PASSWORD = 'password';
}

// mocking libraries
const sinon = require('sinon');
// assertions
const chai = require('chai');
const expect = chai.expect;
const assert = chai.assert;

// request testing library
const request = require('supertest');
// include server from index.js and the objects we'll mock
const server = require('./index');
const { Pool } = require('pg');

describe('GET /acronym', () => {
  let poolConnectStub;
  beforeEach((done) => {
    poolConnectStub = sinon.stub(Pool.prototype, 'connect').resolves();
    return done();
  });
  afterEach((done) => {
    poolConnectStub.restore();
    server.close(done);
  });
  it('gets a page of acronyms', (done) => {
    request(server)
      .get('/acronym')
      .expect(200)
      .then((res) => {
        // do something with response
        console.log(res);
        return done();
      }).catch((err) => {
        console.log(err);
        done(err);
      });
  });
    it('gets a page of acronyms from 50', (done) => {
    request(server)
      .get('/acronym?from=50')
      .expect(200)
      .then((res) => {
        // do something with response
        return done();
      }).catch((err) => {
        console.log(err);
        done(err);
      });
    });
  it('gets a page of acronyms from 50 limit 20', (done) => {
    request(server)
      .get('/acronym?from=50&limit=20')
      .expect(200)
      .then((res) => {
        // do something with response
        return done();
      }).catch((err) => {
        console.log(err);
        done(err);
      });
  });
  it('gets a page of acronyms limit 20', (done) => {
    request(server)
      .get('/acronym?limit=20')
      .expect(200)
      .then((res) => {
        // do something with response
        return done();
      }).catch((err) => {
        console.log(err);
        done(err);
      });
  });
  it('gets a page of acronyms matching the given search', (done) => {
    request(server)
      .get('/acronym?search=WT')
      .expect(200)
      .then((res) => {
        // do something with response
        return done();
      }).catch((err) => {
        console.log(err);
        done(err);
      });
  });
  it('gets a page of acronyms matching the given search from 2 limit 20', (done) => {
    request(server)
      .get('/acronym?search=WT&from=2&limit=20')
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

describe('POST /acronym', () => {
  let poolConnectStub;
  beforeEach((done) => {
    poolConnectStub = sinon.stub(Pool.prototype, 'connect').resolves();
    return done();
  });
  afterEach((done) => {
    poolConnectStub.restore();
    server.close(done);
  });
  it('adds an acronym to the DB', (done) => {
    const name = 'TESTACRONYM';
    const description = 'This acronym has a description';
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
  let poolConnectStub;
  beforeEach((done) => {
    poolConnectStub = sinon.stub(Pool.prototype, 'connect').resolves();
    return done();
  });
  afterEach((done) => {
    poolConnectStub.restore();
    server.close(done);
  });
  it('updates an acronym in the database', (done) => {
    const oldName = 'TESTACRONYM';
    const oldDescription = 'This acronym has a description';
    request(server)
      .post('/acronym')
      .auth(process.env.API_USER, process.env.API_PASSWORD)
      .send({name: oldName, description: oldDescription})
      .set('Accept', 'application/json')
      .expect(200);

    const newName = 'NEWTESTACRONYM';
    const newDescription = 'This acronym has a new description';
    request(server)
      .put(`/acronym/${oldName}`)
      .auth(process.env.API_USER, process.env.API_PASSWORD)
      .send({name: newName, description: newDescription})
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

describe('DELETE /acronym/:acronym', () => {
  let poolConnectStub;
  beforeEach((done) => {
    poolConnectStub = sinon.stub(Pool.prototype, 'connect').resolves();
    return done();
  });
  afterEach((done) => {
    poolConnectStub.restore();
    server.close(done);
  });
  it.only('adds an acronym to the DB and then deletes it', (done) => {
    const name = 'TESTACRONYM';
    const description = 'This acronym has a description';
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
