# Acronym API Demo

[![Test API implementation](https://github.com/DesertFrogSolutions/AcronymApiDemo/actions/workflows/node-test-containerized.yml/badge.svg?branch=main)](https://github.com/DesertFrogSolutions/AcronymApiDemo/actions/workflows/node-test-containerized.yml)

[![Benchmark API implementations w/ Postgres Service Container](https://github.com/DesertFrogSolutions/AcronymApiDemo/actions/workflows/node-benchmark-containerized.yml/badge.svg)](https://github.com/DesertFrogSolutions/AcronymApiDemo/actions/workflows/node-benchmark-containerized.yml)

This is a tech demo demonstrating an API built on Node.JS in 2022, and now serves as a case study in the maintenance burden for an API built in NodeJS without significant feature work.
For the purposes of comparing performance and ergonomics, we completed multiple implementations of the same API in this repository using different Node.JS web server frameworks.

- [Node.JS HTTP Module](https://nodejs.org/docs/latest/api/http.html) (`plain`)
- [Restify](https://github.com/restify/node-restify) (`restify`)
- [Fastify](https://github.com/fastify/fastify) (`fastify`)
- [Express](https://github.com/expressjs/express) (`express`)
- [Koa](https://github.com/koajs/koa) (`koa`)

> *Note* - Neither the PostgreSQL backend nor the web server implementations are configured to be production-ready.
> This program is distributed in the hope that it will be useful,
> but WITHOUT ANY WARRANTY; without even the implied warranty of
> MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.

For more information, reach out to the team at [desert.frog.solutions@gmail.com](mailto:desert.frog.solutions@gmail.com) or [desertfrogsolutions.com](https://desertfrogsolutions.com)

## Install & Initialize PostgreSQL DB

1. Install [PostgreSQL](https://www.postgresql.org).

2. Start a database instance
```sh
/usr/local/opt/postgresql/bin/postgres -D /usr/local/var/postgres
```

By default, the database listens to `localhost:5432`.

3. Initialize `acronymapi` user with password `password` and database `defaultdb`

```sql
CREATE USER acronymapi PASSWORD 'password';
CREATE DATABASE defaultdb WITH OWNER = acronymapi;
GRANT ALL PRIVILEGES ON DATABASE defaultdb TO acronymapi;
```

4. Run initdb script (generated from [acronym.json](./acronym.json) by [src/generate-initdb.js](src/generate-initdb.js) with `npm run generate-initdb`.)

```sh
PGPASSWORD=password psql --file=./initdb.sql --username=acronymapi --dbname=defaultdb
```

## Configure, Start, and Test NodeJS server

### Configuration

Default configuration aligned with the setup above is provided - see [`example.config.json`](./example.config.json) for a template. The default [node-postgres](https://node-postgres.com) environment variables are used to interface with the database. The authentication information for the Put and Delete endpoints is `API_USER` and `API_PASSWORD`.

Since the server uses [nconf](https://www.npmjs.com/package/nconf), it supports hierarchical configuration:

- command line arguments, parsed by [yargs](https://www.npmjs.com/package/yargs) (e.g. --foo baz, also nested: --foo.bar=baz)
- environment variables
- config.json in the project root directory

All configuration sources that were found will be flattened into one object, so that sources earlier in this list override later ones.

### Start the Server

Start the server you select (e.g. `express`) with Node:

```sh
npm run start:express
```

If actively developing the server (or you just want hot reloading), use `nodemon` to start the server with

```sh
npm run dev:express
```

### Testing

The `spec.js` file contains functional tests in [Mocha](https://mochajs.org/) for the server with the PostgreSQL access stubbed out with [Sinon](https://sinonjs.org/). Run them with

```sh
npm run test
```

If actively developing the code, run [Mocha](https://mochajs.org/) in "watch" mode with

```sh
npm run test:watch
```

If running with a "live" and initialized PostgreSQL database (e.g. started with `docker-compose up database`, run tests without mocked DB calls with

```sh
npm --test_live_pg_server=true run test
```

> The test results can be validated in the database by using e.g. `PGPASSWORD=password psql -h localhost -U acronymapi -d defaultdb` and querying `SELECT * FROM acronym WHERE name LIKE '%ACRONYM%';` to find a PUTACRONYM and a POSTACRONYM

If running with a "live" NodeJS application (e.g. started with `docker-compose up backend` or `npm run start:express` etc.), run tests against the live endpoint with

```sh
npm --test_live_node_server=true run test:express
```

### Benchmarks

Benchmarks are automated using [Autocannon](https://github.com/mcollina/autocannon); with a server running in another process, run benchmarks with the command
