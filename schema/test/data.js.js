// data.js:

"use strict";

// load all necessary modules
const Schema = require("../index.js");

// destructure all data types
const {
  boolean,
  compare,
  date,
  email,
  enumerated,
  float,
  integer,
  match,
  password,
  string,
  time,
  timestamp,
} = Schema.types;

const dataSchema = new Schema({
  boolean1: boolean(),
  compare1: compare({}),
  date1: date({}),
  email1: email({}),
  enumerated1: enumerated({}),
  float1: float({}),
  integer1: integer({}),
  match1: match({}),
  password1: password({}),
  string1: string({}),
  time1: time({}),
  timestam1: timestamp({}),
});

const data = {
  boolean1: true,
  compare1: "abcdef-123456",
  date: "2025-05-24",
  email1: "donald_duck@disney.com",
  enumerated1: "subscriber",
  float1: 3.14,
  integer1: 1234,
  match1: "this is a greeting",
  password1: "abcdef-123456",
  string1: "Donald Duck",
  time1: "14:56:32",
  timestamp1: "2025-05-24 14:56:32",
};

module.exports = { data, dataSchema };
