const fs = require('node:fs');
const xlsx = require('xlsx');
xlsx.set_fs(fs);

// Use for v1 (will be the latest raw data from Analytics)
const xlsxFilepath = 'docs/bls-data/World-Campus-BLS-Data-Latest.xlsx';

// Using these for development
// Current data format that Analytics is sending (incl. Greg formatting)
const oldXlsxFilepath = 'docs/bls-data/World-Campus-BLS-Data-Sample.xlsx';
// Raw data format that Analytics should be sending in the future
const rawXlsxFilepath = 'docs/bls-data/World-Campus-BLS-Data-Latest.xlsx';

// Parse old format
const parseOld = false;
const formatOldAsProspect = false;
if (parseOld) {
	if (fileExists(oldXlsxFilepath)) {
		let workbook = readFileToWorkbook(oldXlsxFilepath);
		if (typeof workbook !== 'undefined') {
			// Initial parsing
			let outlooksOldRaw, titlesOldRaw;
			try {
				if (workbook.SheetNames.includes('Employment')) {
					// Deleting empty columns that show up when using the defval:"" option with sheet_to_json function
					delete_cols(workbook.Sheets['Employment'], 10, 4);
					// defval:"" will include null/empty cells, keeping the json structure consistent
					outlooksOldRaw = xlsx.utils.sheet_to_json(workbook.Sheets['Employment'], { defval: "" });
				} else {
					throw `Sheet \'Employment\' not found in workbook \'${oldXlsxFilepath}\'`;
				}
				if (workbook.SheetNames.includes('Job Titles')) {
					titlesOldRaw = xlsx.utils.sheet_to_json(workbook.Sheets['Job Titles'], { defval: "" });
				} else {
					throw `Sheet \'Job Titles\' not found in workbook \'${oldXlsxFilepath}\'`;
				}
			} catch (err) {
				console.error(`Error during sheet conversion:\n${err}`);
				console.warn('Exiting parse block');
				return;
			}
			// Format data
			let outlooksOldFormatted = JSON.parse(JSON.stringify(outlooksOldRaw));
			let titlesOldFormatted = JSON.parse(JSON.stringify(titlesOldRaw));
			let outlooksOldProspectRestuctured = [];
			let titlesOldProspectRestuctured = [];
			let outlooksOldOutput, titlesOldOutput;
			try {
				// Format outlooks
				const seenOccCodes = new Set();
				for (outlook of outlooksOldFormatted) {
					// Reformat 'tot_emp' field to integer
					let totEmpFormatted = parseInt(outlook['tot_emp'].replace(/[,]/g, ''), 10);
					outlook['tot_emp'] = totEmpFormatted;

					// Restructure outlooks (prospect format)
					if (formatOldAsProspect) {
						let currOccCode = outlook['occ_code'];
						outlook['programs'] = [outlook['prospect_code']];
						// console.log(outlook);
						if (seenOccCodes.has(currOccCode)) {
							let currOccIndex = outlooksOldProspectRestuctured.findIndex((element) => element['occ_code'] === currOccCode);
							outlooksOldProspectRestuctured[currOccIndex]['programs'].push(outlook['prospect_code']);
						} else {
							seenOccCodes.add(outlook['occ_code']);
							outlooksOldProspectRestuctured.push(outlook);
						}
					}
				}

				// Iterate through restructured outlooks, restructure titles (prospect format)
				if (formatOldAsProspect) {
					for (outlook of outlooksOldProspectRestuctured) {
						let roundedSortOrder = parseInt(Math.round(outlook['sort_order']), 10);
						outlook['sort_order'] = roundedSortOrder;
						outlook['uid'] = outlook['occ_code'];
						delete outlook['area_title'];
						delete outlook['program_id'];
						delete outlook['program_name'];
						delete outlook['deprecated'];
						delete outlook['occ_code'];
						delete outlook['prospect_code'];
					}
					// Formatting job titles
					const seenJobTitles = new Set();
					for (let title of titlesOldFormatted) {
						title['job_title'] = title['job_titles'];
						let currJobTitle = title['job_title'];
						title['programs'] = [title['prospect_code']];
						if (seenJobTitles.has(currJobTitle)) {
							let currTitleIndex = titlesOldProspectRestuctured.findIndex((element) => element['job_title'] === currJobTitle);
							titlesOldProspectRestuctured[currTitleIndex]['programs'].push(title['prospect_code']);
						} else {
							seenJobTitles.add(title['job_title']);
							titlesOldProspectRestuctured.push(title);
						}
						delete title['deprecated'];
						delete title['job_titles'];
						delete title['program_id'];
						delete title['program_name'];
						delete title['prospect_code'];
					}
					outlooksOldOutput = JSON.parse(JSON.stringify(outlooksOldProspectRestuctured));
					titlesOldOutput = JSON.parse(JSON.stringify(titlesOldProspectRestuctured));
				} else {
					outlooksOldOutput = JSON.parse(JSON.stringify(outlooksOldFormatted));
					titlesOldOutput = JSON.parse(JSON.stringify(titlesOldFormatted));
				}
			} catch (formattingError) {
				console.error(`Formatting error for job outlooks:\n${formattingError}`);
				console.warn('Reverting to raw job outlook data for export');
				outlooksOldOutput = JSON.parse(JSON.stringify(outlooksOldRaw));
				titlesOldOutput = JSON.parse(JSON.stringify(titlesOldRaw));
			}
			let oldDataJsonOutput = `{\"job_outlooks\":${JSON.stringify(outlooksOldOutput)},\"job_titles\":${JSON.stringify(titlesOldOutput)}}`;
			let oldDataOutputFilepath = 'docs/bls-data/wc-bls-data-old-raw.json';
			if (formatOldAsProspect) {
				oldDataOutputFilepath = 'docs/bls-data/wc-bls-data-old-prospect.json';
			}
			outputJsonToFile(oldDataJsonOutput, oldDataOutputFilepath);
		} else {
			console.error('Workbook undefined');
		}
	}
}

// Parse raw format
if (fileExists(rawXlsxFilepath)) {
	let workbook = readFileToWorkbook(rawXlsxFilepath);
	if (typeof workbook !== 'undefined') {

		// Inital parsing
		let outlooksJsonRaw, titlesJsonRaw;
		try {
			if (workbook.SheetNames.includes('Employment')) {
				// defval:"" will include null/empty cells, keeping the json structure consistent
				outlooksJsonRaw = xlsx.utils.sheet_to_json(workbook.Sheets['Employment'], { defval: "" });
			} else {
				throw `Sheet \'Employment\' not found in workbook \'${rawXlsxFilepath}\'`;
			}
			if (workbook.SheetNames.includes('Job Titles')) {
				titlesJsonRaw = xlsx.utils.sheet_to_json(workbook.Sheets['Job Titles'], { defval: "" });
			} else {
				throw `Sheet \'Job Titles\' not found in workbook \'${rawXlsxFilepath}\'`;
			}
		} catch (err) {
			console.error(`Error during sheet conversion:\n${err.stack}`);
			console.warn('Exiting function');
			return;
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
		outputMap = new Map();
		outputMap.set('docs/bls-data/wc-bls-data-raw.json', `{\"job_outlooks\":${JSON.stringify(outlooksJsonRaw)},\"job_titles\":${JSON.stringify(titlesJsonRaw)}}`);
		outputMap.set('docs/bls-data/wc-bls-data-prospect.json', `{\"job_outlooks\":${JSON.stringify(outlooksJsonProspectOutput)},\"job_titles\":${JSON.stringify(titlesJsonProspectOutput)}}`);

		outputMap.forEach((filepath, json) => { outputJsonToFile(filepath, json) });
	} else {
		console.error('Workbook undefined');
	}
}

function fileExists(filepath) {
	if (fs.existsSync(filepath)) {
		console.log(`File \'${filepath}\' exists`);
		return true;
	} else {
		console.error(`File \'${filepath}\' does not exist or is inaccessible`);
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
	}
}

// The following utility functions were written by SheetJSDev on an issue comment: https://github.com/SheetJS/sheetjs/issues/413#issuecomment-456979011

function clamp_range(range) {
	if (range.e.r >= (1 << 20)) range.e.r = (1 << 20) - 1;
	if (range.e.c >= (1 << 14)) range.e.c = (1 << 14) - 1;
	return range;
}

var crefregex = /(^|[^._A-Z0-9])([$]?)([A-Z]{1,2}|[A-W][A-Z]{2}|X[A-E][A-Z]|XF[A-D])([$]?)([1-9]\d{0,5}|10[0-3]\d{4}|104[0-7]\d{3}|1048[0-4]\d{2}|10485[0-6]\d|104857[0-6])(?![_.\(A-Za-z0-9])/g;

/*
	deletes `ncols` cols STARTING WITH `start_col`
	- ws         = worksheet object
	- start_col  = starting col (0-indexed) | default 0
	- ncols      = number of cols to delete | default 1
*/
function delete_cols(ws, start_col, ncols) {
	if (!ws) throw new Error("operation expects a worksheet");
	var dense = Array.isArray(ws);
	if (!ncols) ncols = 1;
	if (!start_col) start_col = 0;

	/* extract original range */
	var range = xlsx.utils.decode_range(ws["!ref"]);
	var R = 0, C = 0;

	var formula_cb = function ($0, $1, $2, $3, $4, $5) {
		var _R = xlsx.utils.decode_row($5), _C = xlsx.utils.decode_col($3);
		if (_C >= start_col) {
			_C -= ncols;
			if (_C < start_col) return "#REF!";
		}
		return $1 + ($2 == "$" ? $2 + $3 : xlsx.utils.encode_col(_C)) + ($4 == "$" ? $4 + $5 : xlsx.utils.encode_row(_R));
	};

	var addr, naddr;
	/* move cells and update formulae */
	if (dense) {
	} else {
		for (C = start_col + ncols; C <= range.e.c; ++C) {
			for (R = range.s.r; R <= range.e.r; ++R) {
				addr = xlsx.utils.encode_cell({ r: R, c: C });
				naddr = xlsx.utils.encode_cell({ r: R, c: C - ncols });
				if (!ws[addr]) { delete ws[naddr]; continue; }
				if (ws[addr].f) ws[addr].f = ws[addr].f.replace(crefregex, formula_cb);
				ws[naddr] = ws[addr];
			}
		}
		for (C = range.e.c; C > range.e.c - ncols; --C) {
			for (R = range.s.r; R <= range.e.r; ++R) {
				addr = xlsx.utils.encode_cell({ r: R, c: C });
				delete ws[addr];
			}
		}
		for (C = 0; C < start_col; ++C) {
			for (R = range.s.r; R <= range.e.r; ++R) {
				addr = xlsx.utils.encode_cell({ r: R, c: C });
				if (ws[addr] && ws[addr].f) ws[addr].f = ws[addr].f.replace(crefregex, formula_cb);
			}
		}
	}

	/* write new range */
	range.e.c -= ncols;
	if (range.e.c < range.s.c) range.e.c = range.s.c;
	ws["!ref"] = xlsx.utils.encode_range(clamp_range(range));

	/* merge cells */
	if (ws["!merges"]) ws["!merges"].forEach(function (merge, idx) {
		var mergerange;
		switch (typeof merge) {
			case 'string': mergerange = xlsx.utils.decode_range(merge); break;
			case 'object': mergerange = merge; break;
			default: throw new Error("Unexpected merge ref " + merge);
		}
		if (mergerange.s.c >= start_col) {
			mergerange.s.c = Math.max(mergerange.s.c - ncols, start_col);
			if (mergerange.e.c < start_col + ncols) { delete ws["!merges"][idx]; return; }
			mergerange.e.c -= ncols;
			if (mergerange.e.c < mergerange.s.c) { delete ws["!merges"][idx]; return; }
		} else if (mergerange.e.c >= start_col) mergerange.e.c = Math.max(mergerange.e.c - ncols, start_col);
		clamp_range(mergerange);
		ws["!merges"][idx] = mergerange;
	});
	if (ws["!merges"]) ws["!merges"] = ws["!merges"].filter(function (x) { return !!x; });

	/* cols */
	if (ws["!cols"]) ws["!cols"].splice(start_col, ncols);
}