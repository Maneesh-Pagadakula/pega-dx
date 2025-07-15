import XLSX from 'xlsx';
import fs from 'fs';
import path from 'path';
import APIFormat from './APIFormat.js';

export class ExcelReader {
  constructor(excelFilePath) {
    this.workbook = XLSX.readFile(excelFilePath);
  }

  readAPIListFromExcel(sheetName) {
    const sheet = this.workbook.Sheets[sheetName];
    if (!sheet) throw new Error(`Sheet "${sheetName}" not found`);

    const rows = XLSX.utils.sheet_to_json(sheet, { defval: '' });
    const dataMap = new Map();

    rows.forEach(row => {
      const api = new APIFormat(row);

      if (
        api.payloadType.toLowerCase() === 'body' &&
        api.payloadFormat.toLowerCase() === 'json' &&
        api.payload &&
        !api.payload.trim().startsWith('{')
      ) {
          const { content, fullPath } = this.loadJsonPayload(api.payload.trim());
      api.payload = content;
      api.payloadPath = fullPath;  // ← Assign the file path
      }

      if (api.scenario) {
        dataMap.set(api.scenario, api);
      }
    });

    return dataMap;
  }

  readKeyValuePairs(sheetName) {
    const sheet = this.workbook.Sheets[sheetName];
    if (!sheet) throw new Error(`Sheet "${sheetName}" not found`);

    const rows = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' });
    const kvMap = new Map();

    rows.forEach(([key, value]) => {
      if (key) kvMap.set(String(key).trim(), String(value).trim());
    });

    console.log(Object.fromEntries(kvMap));
    return kvMap;
  }

  loadJsonPayload(fileName) {
    const fullPath = path.resolve('resources/request-payloads', fileName);
    if (!fs.existsSync(fullPath)) {
      throw new Error(`Payload file not found: ${fullPath}`);
    }
  const content = fs.readFileSync(fullPath, 'utf-8');
  return { content, fullPath }; // ← return both
  }
}
