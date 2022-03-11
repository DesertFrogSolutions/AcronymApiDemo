if (!process.env.API_USER) {
  process.env.API_USER = 'username';
}
if (!process.env.API_PASSWORD) {
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

// usage:
// const t = generateArray();
// const v = generateArray(10, (n) => {return {value: n};});

function generateArray(length=10, generator = (n) => {return n+1;}) {
  return Array.from({length: length}, (_, i) => generator(i));
}

describe.only('GET /acronym', () => {
  let poolConnectStub;
  let queryConnectStub;
  beforeEach((done) => {
    poolConnectStub = sinon.stub(Pool.prototype, 'connect').resolves();
    return done();
  });
  afterEach((done) => {
    poolConnectStub.restore();
    queryConnectStub.restore();
    server.close(done);
  });
  it('gets a page of acronyms', (done) => {
    const resultRows = generateArray(10, (n) => {return {acronym_id: n, name: `acronym ${n}`};});
    queryConnectStub = sinon.stub(Pool.prototype, 'query');
    queryConnectStub.onCall(0).resolves({rows: [{result_count: 500}]});
    queryConnectStub.onCall(1).resolves({rows: resultRows});
    request(server)
      .get('/acronym')
      .expect(200)
      .then((res) => {
        // do something with response
        // console.log(res);
        if ('link' in res.headers) {
          assert.isOk(res.headers.link);
        } else {
          assert.isOk(false, 'no link header');
        }
        assert.isOk(res.body);
        assert.isAtLeast(res.body.length, resultRows.length);
        return done();
      }).catch((err) => {
        console.log(err);
        done(err);
      });
  });
  it('gets a page of acronyms from 50', (done) => {
    const resultRows = generateArray(10, (n) => {return {acronym_id: n + 50, name: `acronym ${n + 50}`};});
    queryConnectStub = sinon.stub(Pool.prototype, 'query');
    queryConnectStub.onCall(0).resolves({rows: [{result_count: 500}]});
    queryConnectStub.onCall(1).resolves({rows: resultRows});
    request(server)
      .get('/acronym?from=50')
      .expect(200)
      .then((res) => {
        // do something with response
        if ('link' in res.headers) {
          assert.isOk(res.headers.link);
        } else {
          assert.isOk(false, 'no link header');
        }
        assert.isOk(res.body);
        assert.isAtLeast(res.body.length, resultRows.length);
        return done();
      }).catch((err) => {
        console.log(err);
        done(err);
      });
    });
  it('gets a page of acronyms from 50 limit 20', (done) => {
    const resultRows = generateArray(20, (n) => {return {acronym_id: n + 50, name: `acronym ${n + 50}`};});
    queryConnectStub = sinon.stub(Pool.prototype, 'query');
    queryConnectStub.onCall(0).resolves({rows: [{result_count: 500}]});
    queryConnectStub.onCall(1).resolves({rows: resultRows});
    request(server)
      .get('/acronym?from=50&limit=20')
      .expect(200)
      .then((res) => {
        // do something with response
        if ('link' in res.headers) {
          assert.isOk(res.headers.link);
        } else {
          assert.isOk(false, 'no link header');
        }
        assert.isOk(res.body);
        assert.isAtLeast(res.body.length, resultRows.length);
        return done();
      }).catch((err) => {
        console.log(err);
        done(err);
      });
  });
  it('gets a page of acronyms limit 20', (done) => {
    const resultRows = generateArray(20, (n) => {return {acronym_id: n, name: `acronym ${n}`};});
    queryConnectStub = sinon.stub(Pool.prototype, 'query');
    queryConnectStub.onCall(0).resolves({rows: [{result_count: 500}]});
    queryConnectStub.onCall(1).resolves({rows: resultRows});

    request(server)
      .get('/acronym?limit=20')
      .expect(200)
      .then((res) => {
        // do something with response
        if ('link' in res.headers) {
          assert.isOk(res.headers.link);
        } else {
          assert.isOk(false, 'no link header');
        }
        assert.isOk(res.body);
        assert.isAtLeast(res.body.length, resultRows.length);

        return done();
      }).catch((err) => {
        console.log(err);
        done(err);
      });
  });
  it('gets a page of acronyms matching the given search', (done) => {
    const resultRows = generateArray(10, (n) => {return {acronym_id: n, name: `acronym ${n}`};});
    queryConnectStub = sinon.stub(Pool.prototype, 'query');
    queryConnectStub.onCall(0).resolves({rows: [{result_count: 500}]});
    queryConnectStub.onCall(1).resolves({rows: resultRows});

    request(server)
      .get('/acronym?search=WT')
      .expect(200)
      .then((res) => {
        // do something with response
        if ('link' in res.headers) {
          assert.isOk(res.headers.link);
        } else {
          assert.isOk(false, 'no link header');
        }
        assert.isOk(res.body);
        assert.isAtLeast(res.body.length, resultRows.length);

        return done();
      }).catch((err) => {
        console.log(err);
        done(err);
      });
  });
  it('gets a page of acronyms matching the given search from 2 limit 20', (done) => {
    const resultRows = generateArray(20, (n) => {return {acronym_id: n + 2, name: `acronym ${n + 2}`};});
    queryConnectStub = sinon.stub(Pool.prototype, 'query');
    queryConnectStub.onCall(0).resolves({rows: [{result_count: 500}]});
    queryConnectStub.onCall(1).resolves({rows: resultRows});

    request(server)
      .get('/acronym?search=WT&from=2&limit=20')
      .expect(200)
      .then((res) => {
        // do something with response
        if ('link' in res.headers) {
          assert.isOk(res.headers.link);
        } else {
          assert.isOk(false, 'no link header');
        }
        assert.isOk(res.body);
        assert.isAtLeast(res.body.length, resultRows.length);

        return done();
      }).catch((err) => {
        console.log(err);
        done(err);
      });
  });
});

describe('POST /acronym', () => {
  // constants for request parameters
  const name = 'TESTACRONYM';
  const description = 'This acronym has a description';

  // stubs stored into these variables
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
  let poolConnectStub;
  beforeEach((done) => {
    poolConnectStub = sinon.stub(Pool.prototype, 'connect').resolves();
    return done();
  });
  afterEach((done) => {
    poolConnectStub.restore();
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
  it('rejects with invalid authentication', (done) => {
    request(server)
      .put(`/acronym/${oldName}`)
      .auth('fakeuser', 'fakepassword')
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
  it('updates an acronym in the database', (done) => {
    request(server)
      .post('/acronym')
      .auth(process.env.API_USER, process.env.API_PASSWORD)
      .send({name: oldName, description: oldDescription})
      .set('Accept', 'application/json')
      .expect(200);

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
  // constants for request parameters
  const name = 'TESTACRONYM';
  const description = 'This acronym has a description';

  // stubs stored into these variables
  let poolConnectStub;
  beforeEach((done) => {
    poolConnectStub = sinon.stub(Pool.prototype, 'connect').resolves();
    return done();
  });
  afterEach((done) => {
    poolConnectStub.restore();
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
