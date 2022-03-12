# Acronym API Demo

## Install & Initialize Postgres DB

1. Install [PostgreSQL](https://www.postgresql.org).

2. Start a database instance
```sh
/usr/local/opt/postgresql/bin/postgres -D ./usr/local/var/postgres
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

Default configuration aligned with the setup above is provided - see [`example.acronymapirc`](./example.config.json) for a template. The default [node-postgres](https://node-postgres.com) environment variables are used to interface for the database interface. The authentication information for the Put and Delete endpoints is `API_USER` and `API_PASSWORD`.

Since the server uses [nconf](https://www.npmjs.com/package/nconf), it supports hierarchical configuration:

- command line arguments, parsed by [yargs](https://www.npmjs.com/package/yargs) (e.g. --foo baz, also nested: --foo.bar=baz)
- environment variables
- config.json in the project root directory

All configuration sources that were found will be flattened into one object, so that sources earlier in this list override later ones.

### Start the Server

Start the server with Node:

```sh
npm run start
```

If actively developing the server (or you just want hot reloading), use nodemon to start the server with

```sh
npm run dev
```

### Testing

The `spec.js` file contains functional tests in [Mocha](https://mochajs.org/) for the server with the Postgres access stubbed out with [Sinon](https://sinonjs.org/). Run them with

```sh
npm run test
```

If actively developing the code, run [Mocha](https://mochajs.org/) in "watch" mode with

```sh
npm run test:watch
```

If the server and Postgres are "live", run tests against the live server with

```sh
npm --test_live_server=true run test
```
