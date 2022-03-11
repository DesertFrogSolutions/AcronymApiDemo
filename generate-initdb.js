const data = require('./acronym.json');
const escape = require('sqlutils/pg/escape');
const util = require('util');

console.log(`-- Create a trigger to emit an updated_at timestamp with timezone
CREATE OR REPLACE FUNCTION trigger_set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
-- Creation of acronym table
CREATE TABLE IF NOT EXISTS acronym (
  acronym_id serial NOT NULL PRIMARY KEY,
  name text NOT NULL,
  description text NOT NULL,
  created_at timestampz NOT NULL DEFAULT NOW(),
  updated_at timestampz NOT NULL DEFAULT NOW()
);
-- set updated_at for any change to acronym table
CREATE TRIGGER update_acronym_updated_at BEFORE UPDATE ON acronym FOR EACH ROW EXECUTE PROCEDURE trigger_set_updated_at();
-- Create INSERT INTO for data from acronym.json
INSERT INTO acronym (name, description)
VALUES
`);

for (const row of data) {
  for (const key in row) {
    // https://www.postgresql.org/docs/current/sql-syntax-lexical.html#SQL-SYNTAX-DOLLAR-QUOTING
    console.log(util.format("($unk$%s$unk$,$unk$%s$unk$)", escape(key), escape(row[key])));
  }
}
console.log(";");

console.log('SELECT * FROM acronym LIMIT 10;');
