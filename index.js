// logging
const bunyan = require('bunyan');
const log = bunyan.createLogger({name: "acronym"});

// DB access
const { Client } = require('pg');
const client = new Client();

// initialize REST API server
const restify = require('restify');
const server = restify.createServer({
  name: 'acronymapi',
  log: log,
  handleUncaughtExceptions: true
});


function doGet(req, res, next) {

  next();
}

function doPost(req, res, next) {

  next();
}

function doPut(req, res, next) {

  next();
}
function doDelete(req, res, next) {

  next();
}

server.use(restify.plugins.queryParser());


server.get('/acronym', doGet);
server.del('/acronym/:acronym', doDelete);

server.use(restify.plugins.bodyParser());
server.post('/acronym', doPost);
server.put('/acronym/:acronym', doPut);

server.listen(process.env.PORT || 8080, function() {
  console.log('%s listening at %s', server.name, server.url);
});
