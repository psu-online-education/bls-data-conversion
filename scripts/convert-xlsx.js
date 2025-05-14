import { readFile, writeFile, set_fs } from 'xlsx';
import * as fs from 'fs';
set_fs(fs);

var wb = readFile("bls-data-xlsx/test-data.xlsx");
const worksheet = workbook.Sheets[workbook.SheetNames[0]];
const raw_data = XLSX.utils.sheet_to_json(worksheet, {header: 1});
// const raw_data = XLSX.utils.sheet_to_json(worksheet);
// writeFile(wb, "sheetjs.xlsx");
console.log(raw_data);