// DB for close handler
const db = require('./db');

// Include routes for server
const routes = require('./routes.plain');

// include configuration
const config = require('./config');
const _DEBUG = config.conf.get('DEBUG');
const DEBUG = (!!_DEBUG && _DEBUG === 'true');

// https://nodejs.org/api/http.html#class-httpserver
const http = require('http');
const url = require('url');
const errorResponseServer = JSON.stringify({message: 'Server Error'});
const errorResponseClient = JSON.stringify({message: 'Client Error'});

const server = http.createServer(async function (request, response) {
  // console.log('request received:', JSON.stringify(request.url), "startswith? ", request.url.startsWith('/acronym'));
  // console.log(request.method, "GET?", request.method === 'GET');
  const baseURL =  request.protocol + '://' + request.headers.host + '/';

  response.statusCode = 200;
  const contentType = 'application/json';
  response.setHeader('Content-Type', contentType);
  // https://nodejs.org/api/url.html#new-urlinput-base
  const theURL = new URL(request.url, baseURL);
  request.searchParams = theURL.searchParams;

  try {
    if (request.method === 'GET' && request.url.startsWith('/acronym')) {
      await routes.Get(request, response);
      return response.end();
    } else if (request.method === 'GET' && request.url.startsWith('/health-check')) {
      await routes.Health(request, response);
      return response.end();
    } else if (request.method === 'POST' && request.url.startsWith('/acronym')) {
      // parse body streamed from request
      let data = '';
      request.on('data', chunk => {
        data += chunk;
      });
      return request.on('end', async () => {
        request.parsedBody = JSON.parse(data);
        await routes.Post(request, response);
        return response.end();
      });
    } else if (request.method === 'PUT' && request.url.startsWith('/acronym')) {
      // Parse URL parameter from URL pathname
      request.params = { acronym: theURL.pathname.substring(9)};
      // Basic authorization parsing
      const auth = request.headers?.authorization;
      if (!auth) {
        request.username = 'anonymous';
      } else {
        // trim off 'Basic ';
        const authDecoded = atob(auth.substring(6));
        const authParts = authDecoded.split(':');
        if (authParts.length === 2) {
          [request.username, request.password] = authParts;
        } else {
          request.username = 'anonymous';
        }
      }
      // parse body streamed from request
      let data = '';
      request.on('data', chunk => {
        data += chunk;
      });
      return request.on('end', async () => {
        request.parsedBody = JSON.parse(data);
        await routes.Put(request, response);
        return response.end();
      });
    } else if (request.method === 'DELETE' && request.url.startsWith('/acronym')) {
      // Parse URL parameter from URL pathname
      request.params = { acronym: theURL.pathname.substring(9)};
      // Basic authorization parsing
      const auth = request.headers?.authorization;
      if (!auth) {
        request.username = 'anonymous';
      } else {
        // trim off 'Basic ';
        const authDecoded = atob(auth.substring(6));
        const authParts = authDecoded.split(':');
        if (authParts.length === 2) {
          [request.username, request.password] = authParts;
        } else {
          request.username = 'anonymous';
        }
      }
      await routes.Delete(request, response);
      return response.end();
    } else {
      response.statusCode = 400;
      response.write(errorResponseClient, 'utf-8');
      return response.end();
    }
  } catch (err) {
    console.log(err);
    response.statusCode = 500;
    response.write(errorResponseServer, 'utf-8');
    return response.end();
  }
});

// the pool will emit an error on behalf of any idle clients
// it contains if a backend error or network partition happens
db.pool.on('error', (err, client) => {
  console.error('Unexpected error on idle client', err);
  return server.close();
});

if (DEBUG) {
  server.addListener('connection', (socket) => {
    console.log("New connection");
    socket._created = new Date().getTime();
    socket.on("close", function() {
      var now = new Date().getTime();
      console.log(new Date(), "Socket closed, TTL", (now - socket._created)/1000);
    });
    return socket.setTimeout(1000);
  });
} else {
  server.addListener('connection', (socket) => {
    return socket.setTimeout(1000);
  });
}

// cleanup on server close
function doClose() {
  if (DEBUG) {
    console.log('Closing pool.');
  }
  return db.end().then((e) => {
    if (DEBUG) {
      console.log('Closed', e);
    }
    process.exit(0);
  });
}
server.on('close', doClose);

// error handling
function handleError(err, socket) {
  if (!err) {
    return null;
  }
  console.log(err); // log the error
  let message = 'Uncaught Exception';
  if ('message' in err) {
    message = err.message;
  }
  if (!socket.writableEnded) {
    return socket.end('HTTP/1.1 400 Bad Request\r\n\r\n');
  } else {
    return null;
  }
}
server.on('clientError', handleError);

if (require.main === module) {
  const PORT = parseInt(config.conf.get('PORT'));
  server.listen(PORT);
  console.log(`Server running at http://127.0.0.1:${PORT}/`);

  process.on('SIGINT', () => {
    setTimeout(() => {
      console.log('Closing server.');
      server.close(() => {
        console.log('All connections closed.');
      });
    }, 0);
  });
  process.on('SIGTERM', () => {
    setTimeout(() => {
      console.log('Closing server.');
      server.close(() => {
        console.log('All connections closed.');
      });
    }, 0);
  });
}

module.exports = server;
