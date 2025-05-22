const fs = require('node:fs');
const jsonschema = require('jsonschema');

let data, parsedData;
try {
  const d1 = fs.openSync('docs/bls-data/wc-bls-data-sample.json', 'r');
  data = fs.readFileSync(d1).toString();
  fs.closeSync(d1);
  console.log(`File access/read success`);
} catch (err) {
  console.error(`File access/read error:\n${err}`);
}

// GitHub validation test: Valid JSON
try {
  parsedData = JSON.parse(data);
  console.log(`File parse success`);
} catch (parseError) {
  console.error(`File parse error:\n${parseError}`);
}

let validator = new jsonschema.Validator();

const schema = {
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
          "deprecated": {
            "type": "string"
          },
          "program_id": {},
          "program_name": {
            "type": "string"
          },
          "area_title": {
            "type": "string"
          },
          "occ_code": {
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
            "type": "number"
          }
        },
        "required": [
          "prospect_code",
          "deprecated",
          "program_id",
          "program_name",
          "area_title",
          "occ_code",
          "occ_title",
          "tot_emp",
          "employment_change",
          "sort_order"
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
          "deprecated": {
            "type": "string"
          },
          "program_id": {},
          "program_name": {
            "type": "string"
          },
          "job_titles": {
            "type": "string"
          }
        },
        "required": [
          "prospect_code",
          "deprecated",
          "program_id",
          "program_name",
          "job_titles"
        ]
      }
    }
  },
  "required": [
    "job_outlooks",
    "job_titles"
  ]
}

// const jobOutlooksSchema = {

// };

// const jobTitlesSchema = {

// };

// GitHub validation test: Schema Validation
// console.log(validator.validate(parsedData, schema));
if (validator.validate(parsedData, schema).valid) {
  console.log('JSON Valid!');
} else {
  console.warn('JSON Invalid');
}