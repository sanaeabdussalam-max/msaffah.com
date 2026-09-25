import type { NextApiRequest, NextApiResponse } from 'next';
import formidable from 'formidable';
import fs from 'node:fs/promises';
import { requireAdmin } from '../../../lib/admin-auth';
import { previewBusinessImport } from '../../../lib/business-import';

export const config = { api: { bodyParser: false } };

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try { requireAdmin(req); } catch { return res.status(401).json({ message: 'Unauthorized' }); }
  if (req.method !== 'POST') return res.status(405).json({ message: 'Method not allowed' });
  const form = formidable({ maxFiles: 1, maxFileSize: 10 * 1024 * 1024, filter: ({ mimetype, originalFilename }) => Boolean(mimetype?.includes('csv') || mimetype?.includes('spreadsheet') || originalFilename?.match(/\.(csv|xlsx|xls)$/i)) });
  try {
    const [, files] = await form.parse(req);
    const file = Array.isArray(files.file) ? files.file[0] : files.file;
    if (!file) return res.status(400).json({ message: 'Upload a CSV or Excel file as file' });
    const preview = previewBusinessImport(await fs.readFile(file.filepath));
    return res.status(200).json({ staged: true, published: false, ...preview });
  } catch { return res.status(400).json({ message: 'Could not read import file' }); }
}
