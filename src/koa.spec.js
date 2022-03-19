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

// set this flag in npm run command to test against live Postgres server:
// i.e. with Postgres running,
// npm run --test_live_pg_server=true test
const _live_pg_server = process.env?.npm_config_test_live_pg_server || 'false';
const live_pg_server = _live_pg_server ? _live_pg_server === 'true' : false;
// include object to be mocked when not using live server
const { Pool } = require('pg');

// set this flag in npm run command to test against running NodeJS application
// i.e. after running npm run start, run
// npm run --test_live_node_server=true test
const _live_node_server = process.env?.npm_config_test_live_node_server || 'false';
const live_node_server = _live_node_server ? _live_node_server === 'true' : false;

// usage:
// const t = generateArray();
// const v = generateArray(10, (n) => {return {value: n};});
function generateArray(length = 10, generator = (n) => { return n + 1; }) {
  return Array.from({ length: length }, (_, i) => generator(i));
}
describe('Acronym API - Koa', () => {
  if (live_pg_server) {
    console.log('Testing against live PostgreSQL server');
  } else {
    console.log('Testing with PostgreSQL DB mocks');
  }
  let server;
  before((done) => {
    if (live_node_server) {
      const config = require('./config');
      const PORT = config.conf.get('PORT');
      server = `http://localhost:${PORT}`;
      console.log(`Testing against live Node.JS server at ${server}`);
    } else {
      // include server from index.js
      server = require('./koa');
      console.log('Testing against server created in specfile');
    }
    return done();
  });
  after((done) => {
    try {
      if (live_node_server) {
        return done();
      } else {
        return server.close(done);
      }
    } finally {
      setTimeout(function(){process.exit(0);},1000);
    }
  });
  describe('GET /acronym', () => {
    let poolConnectStub;
    let queryConnectStub;
    beforeEach((done) => {
      if (!live_pg_server) {
        poolConnectStub = sinon.stub(Pool.prototype, 'connect').resolves();
      }
      return done();
    });
    afterEach((done) => {
      if (!live_pg_server) {
        try {
          poolConnectStub.restore();
          queryConnectStub?.restore();
        } catch (err) {
          console.log(err);
        }
      }
      return done();
    });
    it('gets a page of acronyms', (done) => {
      if (!live_pg_server) {
        const resultRows = generateArray(10, (n) => { return { acronym_id: n, name: `acronym ${n}` }; });
        queryConnectStub = sinon.stub(Pool.prototype, 'query');
        queryConnectStub.onCall(0).resolves({ rows: [{ result_count: 500 }] });
        queryConnectStub.onCall(1).resolves({ rows: resultRows });
      }
      request(server)
        .get('/acronym')
        .expect(200)
        .then((res) => {
          // do something with response
          // console.log(res.body);
          if ('link' in res.headers) {
            assert.isOk(res.headers.link);
          } else {
            assert.isOk(false, 'no link header');
          }
          assert.isOk(res.body);
          assert.isAtLeast(res.body.length, 1);
          return done();
        }).catch((err) => {
          console.log(err);
          done(err);
        });
    });
    it('gets a page of acronyms from 50', (done) => {
      if (!live_pg_server) {
        const resultRows = generateArray(10, (n) => { return { acronym_id: n + 50, name: `acronym ${n + 50}` }; });
        queryConnectStub = sinon.stub(Pool.prototype, 'query');
        queryConnectStub.onCall(0).resolves({ rows: [{ result_count: 500 }] });
        queryConnectStub.onCall(1).resolves({ rows: resultRows });
      }
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
          assert.isAtLeast(res.body.length, 1);
          return done();
        }).catch((err) => {
          console.log(err);
          done(err);
        });
    });
    it('gets a page of acronyms from 50 limit 20', (done) => {
      if (!live_pg_server) {
        const resultRows = generateArray(20, (n) => { return { acronym_id: n + 50, name: `acronym ${n + 50}` }; });
        queryConnectStub = sinon.stub(Pool.prototype, 'query');
        queryConnectStub.onCall(0).resolves({ rows: [{ result_count: 500 }] });
        queryConnectStub.onCall(1).resolves({ rows: resultRows });
      }
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
          assert.isAtLeast(res.body.length, 1);
          return done();
        }).catch((err) => {
          console.log(err);
          done(err);
        });
    });
    it('gets a page of acronyms limit 20', (done) => {
      if (!live_pg_server) {
        const resultRows = generateArray(20, (n) => { return { acronym_id: n, name: `acronym ${n}` }; });
        queryConnectStub = sinon.stub(Pool.prototype, 'query');
        queryConnectStub.onCall(0).resolves({ rows: [{ result_count: 500 }] });
        queryConnectStub.onCall(1).resolves({ rows: resultRows });
      }
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
          assert.isAtLeast(res.body.length, 1);

          return done();
        }).catch((err) => {
          console.log(err);
          done(err);
        });
    });
    it('gets a page of acronyms matching the given search', (done) => {
      if (!live_pg_server) {
        const resultRows = generateArray(10, (n) => { return { acronym_id: n, name: `acronym ${n}` }; });
        queryConnectStub = sinon.stub(Pool.prototype, 'query');
        queryConnectStub.onCall(0).resolves({ rows: [{ result_count: 500 }] });
        queryConnectStub.onCall(1).resolves({ rows: resultRows });
      }
      request(server)
        .get('/acronym?search=WT')
        .expect(200)
        .then((res) => {
          // do something with response
          // NOTE - there are <= 20 results for this search with actual data
          assert.isOk(res.body);
          assert.isAtLeast(res.body.length, 1);

          return done();
        }).catch((err) => {
          console.log(err);
          done(err);
        });
    });
    it('gets a page of acronyms matching the given search from 2 limit 20', (done) => {
      if (!live_pg_server) {
        const resultRows = generateArray(20, (n) => { return { acronym_id: n + 2, name: `acronym ${n + 2}` }; });
        queryConnectStub = sinon.stub(Pool.prototype, 'query');
        queryConnectStub.onCall(0).resolves({ rows: [{ result_count: 500 }] });
        queryConnectStub.onCall(1).resolves({ rows: resultRows });
      }
      request(server)
        .get('/acronym?search=WT&from=2&limit=20')
        .expect(200)
        .then((res) => {
          // do something with response
          // NOTE - there are <= 20 results for this search with actual data
          assert.isOk(res.body);
          assert.isAtLeast(res.body.length, 1);

          return done();
        }).catch((err) => {
          console.log(err);
          done(err);
        });
    });
  });

  describe('POST /acronym', () => {
    // constants for request parameters
    const name = 'POSTACRONYM';
    const description = 'This acronym has a description and was added in POST';

    // stubs stored into these variables
    let poolConnectStub;
    let queryConnectStub;
    beforeEach((done) => {
      if (!live_pg_server) {
        poolConnectStub = sinon.stub(Pool.prototype, 'connect').resolves();
      }
      return done();
    });
    afterEach((done) => {
      if (!live_pg_server) {
        try {
          poolConnectStub.restore();
          queryConnectStub?.restore();
        } catch (err) {
          console.log(err);
        }
      }
      return done();
    });
    it('returns an error status without a name or description', (done) => {
      request(server)
        .post('/acronym')
        .send({ description: description })
        .set('Accept', 'application/json')
        .expect(400)
        .then((res) => {
          // console.log(res.body);
          return res;
        })
        .catch((err) => {
          console.log(err);
          return err;
        });
      request(server)
        .post('/acronym')
        .send({ name: name })
        .set('Accept', 'application/json')
        .expect(400)
        .then((res) => {
          // console.log(res.body);
          return done();
        })
        .catch((err) => {
          console.log(err);
          done(err);
        });
    });
    it('adds an acronym to the DB', (done) => {
      if (!live_pg_server) {
        queryConnectStub = sinon.stub(Pool.prototype, 'query').resolves();
      }
      request(server)
        .post('/acronym')
        .send({ name: name, description: description })
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
    const oldName = 'PUTACRONYM';
    const oldDescription = 'This acronym has a description and was added by PUT';
    const newName = 'NEWPUTACRONYM';
    const newDescription = 'This acronym has a new description and was modified by PUT';

    // stubs stored into these variables
    let poolConnectStub;
    let queryConnectStub;
    beforeEach((done) => {
      if (!live_pg_server) {
        poolConnectStub = sinon.stub(Pool.prototype, 'connect').resolves();
      }
      return done();
    });
    afterEach((done) => {
      if (!live_pg_server) {
        try {
          poolConnectStub.restore();
          queryConnectStub?.restore();
        } catch (err) {
          console.log(err);
        }
      }
      return done();
    });
    it('rejects without authentication', (done) => {
      request(server)
        .put(`/acronym/${oldName}`)
        .send({ name: newName, description: newDescription })
        .set('Accept', 'application/json')
        .expect(401)
        .then((res) => {
          // do something with response
          // console.log(res.body);
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
        .send({ name: newName, description: newDescription })
        .set('Accept', 'application/json')
        .expect(401)
        .then((res) => {
          // do something with response
          // console.log(res.body);
          return done();
        }).catch((err) => {
          console.log(err);
          done(err);
        });
    });
    it('rejects without a name or description', (done) => {
      request(server)
        .put('/acronym')
        .auth(process.env.API_USER, process.env.API_PASSWORD)
        .send({ description: oldDescription })
        .set('Accept', 'application/json')
        .expect(404)
        .then((res) => {
          // console.log(res.body);
          return res;
        })
        .catch((err) => {
          console.log(err);
          return err;
        });
      request(server)
        .put(`/acronym/${newName}`)
        .auth(process.env.API_USER, process.env.API_PASSWORD)
        .send({ bogus: true })
        .set('Accept', 'application/json')
        .expect(400)
        .then((res) => {
          // do something with response
          // console.log(res.body);
          return done();
        }).catch((err) => {
          console.log(err);
          done(err);
        });
    });
    it('adds an acronym to the database', (done) => {
      if (!live_pg_server) {
        queryConnectStub = sinon.stub(Pool.prototype, 'query').resolves();
      }
      request(server)
        .put(`/acronym/${newName}-1`)
        .auth(process.env.API_USER, process.env.API_PASSWORD)
        .send({ name: newName, description: newDescription })
        .set('Accept', 'application/json')
        .expect(200)
        .then((res) => {
          // do something with response
          // console.log(res.body);
          return done();
        }).catch((err) => {
          console.log(err);
          done(err);
        });
    });
    it('adds an acronym to the database without a name in the body', (done) => {
      if (!live_pg_server) {
        queryConnectStub = sinon.stub(Pool.prototype, 'query').resolves();
      }
      request(server)
        .put(`/acronym/${newName}-2`)
        .auth(process.env.API_USER, process.env.API_PASSWORD)
        .send({ description: newDescription })
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
    it('updates an acronym in the database', (done) => {
      if (!live_pg_server) {
        queryConnectStub = sinon.stub(Pool.prototype, 'query').resolves();
      }
      request(server)
        .post('/acronym')
        .auth(process.env.API_USER, process.env.API_PASSWORD)
        .send({ name: oldName, description: oldDescription })
        .set('Accept', 'application/json')
        .expect(200);

      request(server)
        .put(`/acronym/${newName}`)
        .auth(process.env.API_USER, process.env.API_PASSWORD)
        .send({ name: oldName, description: newDescription })
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
    const name = 'DELETEACRONYM';
    const description = 'This acronym has a description and is modified by DELETE endpoint';

    // stubs stored into these variables
    let poolConnectStub;
    let queryConnectStub;
    beforeEach((done) => {
      if (!live_pg_server) {
        poolConnectStub = sinon.stub(Pool.prototype, 'connect').resolves();
      }
      return done();
    });
    afterEach((done) => {
      if (!live_pg_server) {
        try {
          poolConnectStub.restore();
          queryConnectStub?.restore();
        } catch (err) {
          console.log(err);
        }
      }
      return done();
    });
    it('rejects without a name', (done) => {
      request(server)
        .delete('/acronym')
        .auth(process.env.API_USER, process.env.API_PASSWORD)
        .set('Accept', 'application/json')
        .expect(404)
        .then((res) => {
          // console.log(res.body);
          return done();
        })
        .catch((err) => {
          console.log(err);
          return done(err);
        });
    });
    it('adds an acronym to the DB and then deletes it', (done) => {
      if (!live_pg_server) {
        queryConnectStub = sinon.stub(Pool.prototype, 'query').resolves();
      }
      request(server)
        .post('/acronym')
        .auth(process.env.API_USER, process.env.API_PASSWORD)
        .send({ name: name, description: description })
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
});
