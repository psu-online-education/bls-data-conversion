const fs = require('node:fs');
const xlsx = require('xlsx');
xlsx.set_fs(fs);

const xlsxFilepath = 'bls-data/World-Campus-BLS-Data-Sample.xlsx';

if (fileExists(xlsxFilepath)) {

	let workbook = readFileToWorkbook(xlsxFilepath);
	if (typeof workbook !== 'undefined') {

		let jobOutlooksJsonRaw, jobTitlesJsonRaw;
		try {
			if (workbook.SheetNames.includes('Employment')) {
				// Deleting empty columns that show up when using the defval:"" option with sheet_to_json function
				delete_cols(workbook.Sheets['Employment'], 10, 4);
				// defval:"" will include null/empty cells, keeping the json structure consistent
				jobOutlooksJsonRaw = xlsx.utils.sheet_to_json(workbook.Sheets['Employment'], { defval: "" });
			} else {
				throw 'Sheet \'Employment\' not found in workbook';
			}
			if (workbook.SheetNames.includes('Job Titles')) {
				jobTitlesJsonRaw = xlsx.utils.sheet_to_json(workbook.Sheets['Job Titles'], { defval: "" });
			} else {
				throw 'Sheet \'Job Titles\' not found in workbook';
			}
		} catch (err) {
			console.error(`Error during sheet conversion:\n${err}`);
			console.warn('Exiting function');
			return;
		}

		let jobOutlooksJsonFormatted = jobOutlooksJsonRaw;
		try {
			// Formatting job outlooks
			for (outlook of jobOutlooksJsonFormatted) {
				let totEmpFormatted = outlook['tot_emp'];
				// Remove any commas (if any)
				totEmpFormatted = totEmpFormatted.replace(/[,]/g, '');
				// Convert to integer
				totEmpFormatted = parseInt(totEmpFormatted, 10);
				outlook['tot_emp'] = totEmpFormatted;
			}
		} catch (formattingError) {
			console.error(`Formatting error for job outlooks:\n${formattingError}`);
			console.warn('Reverting to raw job outlook data for export');
			jobOutlooksJsonFormatted = jobOutlooksJsonRaw;
		}

		let jsonToOutput = `{\"job_outlooks\":${JSON.stringify(jobOutlooksJsonFormatted)},\"job_titles\":${JSON.stringify(jobTitlesJsonRaw)}}`;

		let jsonOutputFilepath = 'bls-data/wc-bls-data-sample.json';
		try {
			fs.writeFileSync(jsonOutputFilepath, jsonToOutput);
			console.log(`File write to \'${jsonOutputFilepath}\' successful`);
		} catch (err) {
			console.error(`File write to \'${jsonOutputFilepath}\' error:\n${err}`);
		}
	} else {
		console.error('Workbook undefined');
	}

	// Output secondary formats/formattings for other use-cases here
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

function readFileToWorkbook(filepath) {
	try {
		let workbook = xlsx.readFile(filepath);
		console.log('File read success');
		return workbook;
	} catch (err) {
		console.error(`File read error:\n${err}`);
	}
}

// Utility functions written by SheetJSDev on an issue comment: https://github.com/SheetJS/sheetjs/issues/413#issuecomment-456979011

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