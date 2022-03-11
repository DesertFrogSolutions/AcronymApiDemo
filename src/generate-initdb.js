const data = require('../acronym.json');
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
-- Deletion of acronym table
DROP TABLE IF EXISTS acronym;
-- Creation of acronym table
CREATE TABLE IF NOT EXISTS acronym (
  acronym_id serial NOT NULL PRIMARY KEY,
  name text NOT NULL,
  description text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT NOW(),
  updated_at timestamp with time zone NOT NULL DEFAULT NOW()
);
-- create index for faster searching on name
DROP INDEX IF EXISTS acronym_name_txt;
CREATE INDEX acronym_name_txt ON acronym (name text_pattern_ops);
-- create index for faster searching on description
DROP INDEX IF EXISTS acronym_description_txt;
CREATE INDEX acronym_description_txt ON acronym (description text_pattern_ops);
-- set updated_at for any change to acronym table
DROP TRIGGER IF EXISTS update_acronym_updated_at ON acronym;
CREATE TRIGGER update_acronym_updated_at BEFORE UPDATE ON acronym FOR EACH ROW EXECUTE PROCEDURE trigger_set_updated_at();
-- Create INSERT INTO for data from acronym.json
INSERT INTO acronym (name, description)
VALUES`);

for (const ind in data) {
  const row = data[ind];
  for (const key in row) {
    // https://www.postgresql.org/docs/current/sql-syntax-lexical.html#SQL-SYNTAX-DOLLAR-QUOTING
    if (ind >= data.length - 1) {
      console.log(util.format("(%s,%s);", escape(key), escape(row[key])));
    } else {
      console.log(util.format("(%s,%s),", escape(key), escape(row[key])));
    }
  }
}

console.log('SELECT * FROM acronym LIMIT 10;');
