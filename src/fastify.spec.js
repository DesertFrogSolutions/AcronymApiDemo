// https://github.com/timwis/fastify-supertest-demo
if (!process.env.API_USER) {
  process.env.API_USER = 'username';
}
if (!process.env.API_PASSWORD) {
  process.env.API_PASSWORD = 'password';
}
const authorizationString = Buffer.from(`${process.env.API_USER}:${process.env.API_PASSWORD}`).toString('base64');

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
// include server from index.js
const server = require('./fastify');


// usage:
// const t = generateArray();
// const v = generateArray(10, (n) => {return {value: n};});
function generateArray(length = 10, generator = (n) => { return n + 1; }) {
  return Array.from({ length: length }, (_, i) => generator(i));
}
describe('Acronym API - Fastify', () => {
  if (live_pg_server) {
    console.log('Testing against live PostgreSQL server, fastify');
  }
  if (live_node_server) {
    console.log(`Testing against live Node.JS server not supported for Fastify impl`);
  }
  console.log('Testing against server created in specfile, fastify');

  after((done) => {
    setTimeout(function(){process.exit(0);},1000);
    return done();
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
    it('gets a page of acronyms', async () => {
      if (!live_pg_server) {
        const resultRows = generateArray(10, (n) => { return { acronym_id: n, name: `acronym ${n}` }; });
        queryConnectStub = sinon.stub(Pool.prototype, 'query');
        queryConnectStub.onCall(0).resolves({ rows: [{ result_count: 500 }] });
        queryConnectStub.onCall(1).resolves({ rows: resultRows });
      }
      const r = await server.inject({
        method: 'GET',
        url: '/acronym'
      });
      assert.isOk(r);
      expect(r.statusCode).to.equal(200);
      // console.log(r);
      if ('link' in r.headers) {
        assert.isOk(r.headers.link);
      } else {
        assert.isOk(false, 'no link header');
      }
      assert.isOk(r.body);
      assert.isAtLeast(r.body.length, 1);
    });
    it('gets a page of acronyms from 50', async () => {
      if (!live_pg_server) {
        const resultRows = generateArray(10, (n) => { return { acronym_id: n + 50, name: `acronym ${n + 50}` }; });
        queryConnectStub = sinon.stub(Pool.prototype, 'query');
        queryConnectStub.onCall(0).resolves({ rows: [{ result_count: 500 }] });
        queryConnectStub.onCall(1).resolves({ rows: resultRows });
      }
      const r = await server.inject({
        method: 'GET',
        url: '/acronym?from=50'
      });
      // console.log(r);
      expect(r.statusCode).to.equal(200);
      if ('link' in r.headers) {
        assert.isOk(r.headers.link);
      } else {
        assert.isOk(false, 'no link header');
      }
      assert.isOk(r.body);
      assert.isAtLeast(r.body.length, 1);
    });
    it('gets a page of acronyms from 50 limit 20', async () => {
      if (!live_pg_server) {
        const resultRows = generateArray(20, (n) => { return { acronym_id: n + 50, name: `acronym ${n + 50}` }; });
        queryConnectStub = sinon.stub(Pool.prototype, 'query');
        queryConnectStub.onCall(0).resolves({ rows: [{ result_count: 500 }] });
        queryConnectStub.onCall(1).resolves({ rows: resultRows });
      }
      const r = await server.inject({
        method: 'GET',
        url: '/acronym?from=50&limit=20'
      });
      expect(r.statusCode).to.equal(200);
      if ('link' in r.headers) {
        assert.isOk(r.headers.link);
      } else {
        assert.isOk(false, 'no link header');
      }
      assert.isOk(r.body);
      assert.isAtLeast(r.body.length, 1);
    });
    it('gets a page of acronyms limit 20', async () => {
      if (!live_pg_server) {
        const resultRows = generateArray(20, (n) => { return { acronym_id: n, name: `acronym ${n}` }; });
        queryConnectStub = sinon.stub(Pool.prototype, 'query');
        queryConnectStub.onCall(0).resolves({ rows: [{ result_count: 500 }] });
        queryConnectStub.onCall(1).resolves({ rows: resultRows });
      }
      const r = await server.inject({
        method: 'GET',
        url: '/acronym?limit=20'
      });
      expect(r.statusCode).to.equal(200);
      if ('link' in r.headers) {
        assert.isOk(r.headers.link);
      } else {
        assert.isOk(false, 'no link header');
      }
      assert.isOk(r.body);
      assert.isAtLeast(r.body.length, 1);
    });
    it('gets a page of acronyms matching the given search', async () => {
      if (!live_pg_server) {
        const resultRows = generateArray(10, (n) => { return { acronym_id: n, name: `acronym ${n}` }; });
        queryConnectStub = sinon.stub(Pool.prototype, 'query');
        queryConnectStub.onCall(0).resolves({ rows: [{ result_count: 500 }] });
        queryConnectStub.onCall(1).resolves({ rows: resultRows });
      }
      const r = await server.inject({
        method: 'GET',
        url: '/acronym?search=WT'
      });
      expect(r.statusCode).to.equal(200);
      if ('link' in r.headers) {
        assert.isOk(r.headers.link);
      } else {
        assert.isOk(false, 'no link header');
      }
      assert.isOk(r.body);
      assert.isAtLeast(r.body.length, 1);
    });
    it('gets a page of acronyms matching the given search from 2 limit 20', async () => {
      if (!live_pg_server) {
        const resultRows = generateArray(20, (n) => { return { acronym_id: n + 2, name: `acronym ${n + 2}` }; });
        queryConnectStub = sinon.stub(Pool.prototype, 'query');
        queryConnectStub.onCall(0).resolves({ rows: [{ result_count: 500 }] });
        queryConnectStub.onCall(1).resolves({ rows: resultRows });
      }
      const r = await server.inject({
        method: 'GET',
        url: '/acronym?search=WT&from=2&limit=20'
      });
      expect(r.statusCode).to.equal(200);
      // note - this search has < 20 results with initial data
      assert.isOk(r.body);
      assert.isAtLeast(r.body.length, 1);
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
    it('returns an error status without a name or description', async () => {
      try {
        const r1 = await server.inject({
          method: 'POST',
          url: '/acronym',
          payload: { description: description },
          headers: {
            'Accept': 'application/json'
          }
        });
        expect(r1.statusCode).to.equal(400);
        const r2 = await server.inject({
          method: 'POST',
          url: '/acronym',
          payload: { name: name },
          headers: {
            'Accept': 'application/json'
          }
        });
        expect(r2.statusCode).to.equal(400);
      } catch (err) {
        console.log(err);
        assert.isNotOk(err, 'Unexpected error');
      }
    });
    it('adds an acronym to the DB', async () => {
      if (!live_pg_server) {
        queryConnectStub = sinon.stub(Pool.prototype, 'query').resolves();
      }
      try {
      const r = await server.inject({
        method: 'POST',
        url: '/acronym',
        payload: { name: name, description: description },
        headers: {
          'Accept': 'application/json'
        }
      });
      expect(r.statusCode).to.equal(200);
      } catch (err) {
        console.log(err);
        assert.isNotOk(err, 'Unexpected error');
      }
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
    it('rejects without authentication', async () => {
      try {
        const r = await server.inject({
          method: 'PUT',
          url: `/acronym/${oldName}`,
          payload: { name: newName, description: newDescription },
          headers: {
            'Accept': 'application/json'
          }
        });
        expect(r.statusCode).to.equal(401);
      } catch (err) {
        console.log(err);
        assert.isNotOk(err, 'Unexpected error');
      }
    });
    it('rejects with invalid authentication', async () => {
      try {
        const badAuthorizationString = Buffer.from('fakeuser:fakepassword').toString('base64');
        const r = await server.inject({
          method: 'PUT',
          url: `/acronym/${oldName}`,
          headers: {
            'authorization': `basic ${badAuthorizationString}`,
            'accept': 'application/json'
          },
          payload: { name: newName, description: newDescription }
        });
        expect(r.statusCode).to.equal(401);
      } catch (err) {
        console.log(err);
        assert.isNotOk(err, 'Unexpected error');
      }
    });
    it('rejects without a name or description', async () => {
      try {
        const r1 = await server.inject({
          method: 'PUT',
          url: '/acronym',
          headers: {
            'authorization': `Basic ${authorizationString}`,
            'accept': 'application/json'
          },
          payload: { description: oldDescription }
        });
        expect(r1.statusCode).to.equal(404);
        const r2 = await server.inject({
          method: 'PUT',
          url: `/acronym/${newName}`,
          headers: {
            'authorization': `Basic ${authorizationString}`,
            'accept': 'application/json'
          },
          payload: { bogus: true }
        });
        expect(r2.statusCode).to.equal(400);
      } catch (err) {
        console.log(err);
        assert.isNotOk(err, 'Unexpected error');
      }
    });
    it('adds an acronym to the database', async () => {
      if (!live_pg_server) {
        queryConnectStub = sinon.stub(Pool.prototype, 'query').resolves();
      }
      try {
        const r = await server.inject({
          method: 'PUT',
          url: `/acronym/${newName}-1`,
          headers: {
            'authorization': `Basic ${authorizationString}`,
            'accept': 'application/json'
          },
          payload: { name: newName, description: newDescription }
        });
        expect(r.statusCode).to.equal(200);
      } catch (err) {
        console.log(err);
        assert.isNotOk(err, 'Unexpected error');
      }
    });
    it('adds an acronym to the database without a name in the body', async () => {
      if (!live_pg_server) {
        queryConnectStub = sinon.stub(Pool.prototype, 'query').resolves();
      }
      try {
        const r = await server.inject({
          method: 'PUT',
          url: `/acronym/${newName}-2`,
          headers: {
            'authorization': `Basic ${authorizationString}`,
            'accept': 'application/json'
          },
          payload: { description: newDescription }
        });
        expect(r.statusCode).to.equal(200);
      } catch (err) {
        console.log(err);
        assert.isNotOk(err, 'Unexpected error');
      }
    });
    it('updates an acronym in the database', async () => {
      if (!live_pg_server) {
        queryConnectStub = sinon.stub(Pool.prototype, 'query').resolves();
      }
      try {
        const r1 = await server.inject({
          method: 'POST',
          url: '/acronym',
          headers: {
            'accept': 'application/json'
          },
          payload: { name: oldName, description: oldDescription }
        });
        expect(r1.statusCode).to.equal(200);
        const r2 = await server.inject({
          method: 'PUT',
          url: `/acronym/${newName}`,
          headers: {
            'authorization': `Basic ${authorizationString}`,
            'accept': 'application/json'
          },
          payload: { name: oldName, description: newDescription }
        });
        expect(r2.statusCode).to.equal(200);
      } catch (err) {
        console.log(err);
        assert.isNotOk(err, 'Unexpected error');
      }
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
    it('rejects without a name', async () => {
      const r = await server.inject({
        method: 'DELETE',
        url: '/acronym',
        headers: {
          'authorization': `Basic ${authorizationString}`
        }
      });
      assert.isOk(r);
      expect(r.statusCode).to.equal(404);
    });
    it('adds an acronym to the DB and then deletes it', async () => {
      if (!live_pg_server) {
        queryConnectStub = sinon.stub(Pool.prototype, 'query').resolves();
      }
      try {
        const r1 = await server.inject({
          method: 'POST',
          url: '/acronym',
          headers: {
            'accept': 'application/json'
          },
          payload: { name: name, description: description }
        });
        const r2 = await server.inject({
          method: 'DELETE',
          url: `/acronym/${name}`,
          headers: {
            'authorization': `Basic ${authorizationString}`
          }
        });
        assert.isOk(r2);
        expect(r2.statusCode).to.equal(200);
      } catch (err) {
        console.log(err);
        assert.isNotOk(err, 'Unexpected error');
      }
    });
  });
});
