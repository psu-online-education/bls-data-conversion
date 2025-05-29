const fs = require('node:fs');
const jsonschema = require('jsonschema');

const propectDataPath = 'docs/bls-data/wc-bls-data-prospect.json';
let prospectDataToValidate = parseJsonFile(propectDataPath);

let validator = new jsonschema.Validator();

const prospectSchema = {
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "Generated schema for Root",
  "type": "object",
  "properties": {
    "job_outlooks": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "prospect_code": {
            "type": "string"
          },
          "occ_title": {
            "type": "string"
          },
          "tot_emp": {
            "type": "number"
          },
          "employment_change": {
            "type": "number"
          },
          "sort_order": {
            "type": "integer"
          },
          "uid": {
            "type": "string"
          }
        },
        "required": [
          "prospect_code",
          "occ_title",
          "tot_emp",
          "employment_change",
          "sort_order",
          "uid"
        ]
      }
    },
    "job_titles": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "prospect_code": {
            "type": "string"
          },
          "uid": {
            "type": "string"
          },
          "job_title": {
            "type": "string"
          }
        },
        "required": [
          "prospect_code",
          "uid",
          "job_title"
        ]
      }
    }
  },
  "required": [
    "job_outlooks",
    "job_titles"
  ]
};

// GitHub validation test: Schema Validation
// console.log(validator.validate(parsedData, schema));
if (validator.validate(prospectDataToValidate, prospectSchema).valid) {
  console.log('Prospect JSON Valid!');
} else {
  console.warn('Prospect JSON Invalid');
}

function parseJsonFile(filepath) {
  let data, parsedData;
  try {
    const d1 = fs.openSync(filepath, 'r');
    data = fs.readFileSync(d1).toString();
    fs.closeSync(d1);
    console.log(`File access/read success`);
  } catch (err) {
    console.error(`File access/read error:\n${err.stack}`);
  }

  // GitHub validation test: Valid JSON
  try {
    parsedData = JSON.parse(data);
    console.log(`File parse success`);
    return parsedData;
  } catch (parseError) {
    console.error(`File parse error:\n${parseError.stack}`);
  }
}