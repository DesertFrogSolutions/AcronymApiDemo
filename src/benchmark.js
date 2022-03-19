'use strict';

// https://github.com/mcollina/autocannon
const autocannon = require('autocannon');

// include configuration
const config = require('./config');
// define URL to benchmark
const PORT = config.conf.get('PORT');
const url = `http://localhost:${PORT}`;
// define defaults for autocannon calls
const _opt_defaults = {
  url: url,
  connections: 10, //default
  pipelining: 1, // default
  duration: 10, // (seconds) default
  warmup: {
    connections: 1,
    duration: 1
  }
};
async function runbenchmark() {
  // parameters for healthcheck request benchmark
  const healthResults = await autocannon({
    ..._opt_defaults,
    title: 'HealthCheck',
    requests: [{
      method: 'GET',
      path: '/health-check'
    }]
  });
  console.log('HealthCheck');
  console.log(autocannon.printResult(healthResults, {renderResultsTable: true, renderLatencyTable: true}));

  // parameters for GET requests
  const getResults = await autocannon({
    ..._opt_defaults,
    title: 'GET',
    requests: [{
      method: 'GET',
      path: '/acronym'
    }]
  });
  console.log('GET');
  console.log(autocannon.printResult(getResults, {renderResultsTable: true, renderLatencyTable: true}));

  const getSearchResults = await autocannon({
    ..._opt_defaults,
    title: 'GET w/search',
    requests: [{
      method: 'GET',
      path: '/acronym?search=WT'
    }]
  });
  console.log('GET w/search');
  console.log(autocannon.printResult(getSearchResults, {renderResultsTable: true, renderLatencyTable: true}));

  // define parameters for POST body
  const name = 'POSTACRONYM';
  const description = 'This acronym has a description and was added in POST';

  const postBody = { name: name, description: description };
  const postResults = await autocannon({
    ..._opt_defaults,
    title: 'POST',
    requests: [{
      method: 'POST',
      path: '/acronym',
      headers: {
        'Content-type': 'application/json; charset=utf-8',
      },
      body: JSON.stringify(postBody)
    }]
  });
  console.log('POST');
  console.log(autocannon.printResult(postResults, {renderResultsTable: true, renderLatencyTable: true}));

  // define username and password for authenticated logins
  if (!process.env.API_USER) {
    process.env.API_USER = 'username';
  }
  if (!process.env.API_PASSWORD) {
    process.env.API_PASSWORD = 'password';
  }
  const authorizationString = Buffer.from(`${process.env.API_USER}:${process.env.API_PASSWORD}`).toString('base64');
  const oldName = 'PUTACRONYM';
  const oldDescription = 'This acronym has a description and was added by PUT';
  const newName = 'NEWPUTACRONYM';
  const newDescription = 'This acronym has a new description and was modified by PUT';

  const putBody = { name: oldName, description: newDescription };
  const putResults = await autocannon({
    ..._opt_defaults,
    title: 'PUT',
    requests: [{
      method: 'PUT',
      path: `/acronym/${newName}`,
      headers: {
        'Content-type': 'application/json; charset=utf-8',
        'authorization': `Basic ${authorizationString}`
      },
      body: JSON.stringify(putBody)
    }]
  });
  console.log('PUT');
  console.log(autocannon.printResult(putResults, {renderResultsTable: true, renderLatencyTable: true}));

  const deleteResults = await autocannon({
    ..._opt_defaults,
    title: 'DELETE',
    requests: [{
      method: 'DELETE',
      path: `/acronym/${oldName}`,
      headers: {
        'Content-type': 'application/json; charset=utf-8',
        'authorization': `Basic ${authorizationString}`
      }
    }]
  });
  console.log('DELETE');
  console.log(autocannon.printResult(deleteResults, {renderResultsTable: true, renderLatencyTable: true}));
}

if (require.main === module) {
  runbenchmark();
}
