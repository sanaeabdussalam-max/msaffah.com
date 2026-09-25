import * as XLSX from 'xlsx';

export const REQUIRED_BUSINESS_COLUMNS = ['nameEn', 'nameAr', 'phone', 'slug'];

export interface ImportPreview { headers: string[]; rows: Array<Record<string, unknown>>; errors: string[]; }

export function previewBusinessImport(buffer: Buffer): ImportPreview {
  const workbook = XLSX.read(buffer, { type: 'buffer', cellDates: true });
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  if (!sheet) return { headers: [], rows: [], errors: ['The workbook has no sheets.'] };
  const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, { defval: null });
  const headers = rows.length ? Object.keys(rows[0]) : [];
  const errors = REQUIRED_BUSINESS_COLUMNS.filter((column) => !headers.includes(column)).map((column) => `Missing required column: ${column}`);
  rows.slice(0, 100).forEach((row, index) => {
    REQUIRED_BUSINESS_COLUMNS.forEach((column) => { if (!String(row[column] ?? '').trim()) errors.push(`Row ${index + 2}: ${column} is required`); });
  });
  return { headers, rows: rows.slice(0, 100), errors: [...new Set(errors)] };
}
