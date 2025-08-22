const fs = require('node:fs');
const xlsx = require('xlsx');
xlsx.set_fs(fs);

const xlsxFilepath = 'docs/bls-data/World-Campus-BLS-Data-Latest.xlsx';

// Parse raw format
if (fileExists(xlsxFilepath)) {
	console.log(`File \'${xlsxFilepath}\' exists`);
	let workbook = readFileToWorkbook(xlsxFilepath);
	if (typeof workbook !== 'undefined') {

		// Inital parsing
		let outlooksJsonRaw, titlesJsonRaw;
		try {
			if (workbook.SheetNames.includes('Employment')) {
				// defval:"" will include null/empty cells, keeping the json structure consistent
				outlooksJsonRaw = xlsx.utils.sheet_to_json(workbook.Sheets['Employment'], { defval: "" });
			} else {
				throw `Sheet \'Employment\' not found in workbook \'${xlsxFilepath}\'`;
			}
			if (workbook.SheetNames.includes('Job Titles')) {
				titlesJsonRaw = xlsx.utils.sheet_to_json(workbook.Sheets['Job Titles'], { defval: "" });
			} else {
				throw `Sheet \'Job Titles\' not found in workbook \'${xlsxFilepath}\'`;
			}
		} catch (err) {
			console.error(`Error during sheet conversion:\n${err.stack}`);
			console.warn('Exiting process...');
			process.exit(1);
		}

		// Format for prospect use
		// Initialize copies of raw as a "deep copy" using stringify -> parse to unlink objects and preserve original
		let outlooksJsonProspect = JSON.parse(JSON.stringify(outlooksJsonRaw));
		let titlesJsonProspect = JSON.parse(JSON.stringify(titlesJsonRaw));
		let outlooksJsonProspectRestuctured = [];
		let titlesJsonProspectRestuctured = [];
		let outlooksJsonProspectOutput, titlesJsonProspectOutput;
		try {

			// Iterate through outlooks
			const seenOccCodes = new Set();
			for (let outlook of outlooksJsonProspect) {
				// Use 'occ_code' as a primary key to merge multiple 'prospect_code' into 'programs'
				let currOccCode = outlook['occ_code'];
				outlook['programs'] = [outlook['prospect_code']];
				if (seenOccCodes.has(currOccCode)) {
					let currOccIndex = outlooksJsonProspectRestuctured.findIndex((element) => element['occ_code'] === currOccCode);
					outlooksJsonProspectRestuctured[currOccIndex]['programs'].push(outlook['prospect_code']);
				} else {
					seenOccCodes.add(outlook['occ_code']);
					outlooksJsonProspectRestuctured.push(outlook);
				}
			}

			// Iterate through restructured outlooks
			for (outlook of outlooksJsonProspectRestuctured) {
				// Round and int-ify sort order
				let roundedSortOrder = parseInt(Math.round(outlook['sort_order']), 10);
				outlook['sort_order'] = roundedSortOrder;
				
				outlook['uid'] = outlook['occ_code']; // "Rename" property

				// Delete unused properties
				delete outlook['area_title'];
				delete outlook['program_id'];
				delete outlook['program_name'];
				delete outlook['deprecated'];
				delete outlook['occ_code'];
				delete outlook['prospect_code'];
			}

			// Iterate through titles
			const seenJobTitles = new Set();
			for (let title of titlesJsonProspect) {
				title['job_title'] = title['job_titles']; // "Rename" property

				// Use 'job_title' as a primary key to merge multiple 'prospect_code' into 'programs'
				let currJobTitle = title['job_title'];
				title['programs'] = [title['prospect_code']];
				if (seenJobTitles.has(currJobTitle)) {
					let currTitleIndex = titlesJsonProspectRestuctured.findIndex((element) => element['job_title'] === currJobTitle);
					titlesJsonProspectRestuctured[currTitleIndex]['programs'].push(title['prospect_code']);
				} else {
					seenJobTitles.add(title['job_title']);
					titlesJsonProspectRestuctured.push(title);
				}

				// Delete unused properties
				delete title['deprecated'];
				delete title['job_titles'];
				delete title['program_id'];
				delete title['program_name'];
				delete title['prospect_code'];
			}
			outlooksJsonProspectOutput = JSON.parse(JSON.stringify(outlooksJsonProspectRestuctured));
			titlesJsonProspectOutput = JSON.parse(JSON.stringify(titlesJsonProspectRestuctured));
		} catch (formattingError) {
			console.error(`Formatting error for prospect output:\n${formattingError.stack}`);
			console.warn('Reverting to raw data for output');
			outlooksJsonProspectOutput = JSON.parse(JSON.stringify(outlooksJsonRaw));
			titlesJsonProspectOutput = JSON.parse(JSON.stringify(titlesJsonRaw));
		}

		// Outputs
		let combinedRawOutput = JSON.parse(`{\"job_outlooks\":${JSON.stringify(outlooksJsonRaw)},\"job_titles\":${JSON.stringify(titlesJsonRaw)}}`);
		let combinedProspectOutput = JSON.parse(`{\"job_outlooks\":${JSON.stringify(outlooksJsonProspectOutput)},\"job_titles\":${JSON.stringify(titlesJsonProspectOutput)}}`);

		let outputMap = new Map();
		outputMap.set('docs/bls-data/wc-bls-data-raw.json', `${JSON.stringify(combinedRawOutput, null, 2)}`);
		outputMap.set('docs/bls-data/wc-bls-data-prospect.json', `${JSON.stringify(combinedProspectOutput, null, 2)}`);

		outputMap.forEach((filepath, json) => { outputJsonToFile(filepath, json) });
	} else {
		console.error('Workbook undefined');
		console.warn('Exiting process...');
		process.exit(1);
	}
} else {
	console.error(`File \'${xlsxFilepath}\' does not exist or is inaccessible`);
	console.warn('Exiting process...');
	process.exit(1);
}

function fileExists(filepath) {
	if (fs.existsSync(filepath)) {
		return true;
	} else {
		return false;
	}
}

/**
 * Reads .xlsx file and returns it as a WorkBook.
 * @param {string} filepath - Path of .xlsx file to read.
 * @returns {xlsx.WorkBook}
 */
function readFileToWorkbook(filepath) {
	try {
		let workbook = xlsx.readFile(filepath);
		console.log('File read success');
		return workbook;
	} catch (err) {
		console.error(`File read error:\n${err}`);
		console.warn('Exiting process...');
		process.exit(1);
	}
}

/**
 * Writes JSON to file.
 * @param {string} jsonToOutput - JSON to output (stringified).
 * @param {string} filepathToWrite - Output file path.
 */
function outputJsonToFile(jsonToOutput, filepathToWrite) {
	try {
		fs.writeFileSync(filepathToWrite, jsonToOutput);
		console.log(`File write to \'${filepathToWrite}\' successful`);
	} catch (err) {
		console.error(`File write to \'${filepathToWrite}\' error:\n${err}`);
		console.warn('Exiting process...');
		process.exit(1);
	}
}
