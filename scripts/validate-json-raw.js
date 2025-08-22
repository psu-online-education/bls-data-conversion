const fs = require('node:fs');
const jsonschema = require('jsonschema');

const rawDataPath = 'docs/bls-data/wc-bls-data-raw.json';
let rawDataToValidate = parseJsonFile(rawDataPath);

let validator = new jsonschema.Validator();

const rawSchema = {
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
};

// GitHub validation test: Schema Validation
try {
  console.log(validator.validate(rawDataToValidate, rawSchema, {throwError: true, throwAll: true}));
  console.log('Raw JSON validated');
} catch (validationError) {
  console.warn('Raw JSON invalid');
  console.error(validationError);
  console.warn('Exiting process...');
	process.exit(1);
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
    console.warn('Exiting process...');
		process.exit(1);
  }

  // GitHub validation test: Valid JSON
  try {
    parsedData = JSON.parse(data);
    console.log(`File parse success`);
    return parsedData;
  } catch (parseError) {
    console.error(`File parse error:\n${parseError.stack}`);
    console.warn('Exiting process...');
		process.exit(1);
  }
}