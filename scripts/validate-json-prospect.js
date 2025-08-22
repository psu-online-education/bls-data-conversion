const fs = require('node:fs');
const jsonschema = require('jsonschema');

const propectDataPath = 'docs/bls-data/wc-bls-data-prospect.json';
let prospectDataToValidate = parseJsonFile(propectDataPath);

let validator = new jsonschema.Validator();

const prospectSchema = {
  "title": "Generated schema for Root",
  "type": "object",
  "properties": {
    "job_outlooks": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
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
          },
          "programs": {
            "type": "array",
            "items": {
              "type": "string"
            }
          },
          "uid": {
            "type": "string"
          }
        },
        "required": [
          "occ_title",
          "tot_emp",
          "employment_change",
          "sort_order",
          "programs",
          "uid"
        ]
      }
    },
    "job_titles": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "job_title": {
            "type": "string"
          },
          "programs": {
            "type": "array",
            "items": {
              "type": "string"
            }
          }
        },
        "required": [
          "job_title",
          "programs"
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
  console.log(validator.validate(prospectDataToValidate, prospectSchema, {throwError: true, throwAll: true}));
  console.log('Prospect JSON validated');
} catch (validationError) {
  console.warn('Prospect JSON invalid');
  console.error(validationError);
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