import type { NextApiRequest, NextApiResponse } from 'next';
import { requireAdmin } from '../../../lib/admin-auth';
import { createEncryptedPublicDataExport } from '../../../lib/backup-export';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try { requireAdmin(req); } catch { return res.status(401).json({ message: 'Unauthorized' }); }
  if (req.method !== 'POST') return res.status(405).json({ message: 'Method not allowed' });
  try {
    const backup = await createEncryptedPublicDataExport();
    res.setHeader('Content-Type', 'application/octet-stream');
    res.setHeader('Content-Disposition', `attachment; filename="masfah-public-${new Date().toISOString().slice(0, 10)}.backup"`);
    return res.status(200).send(backup);
  } catch { return res.status(500).json({ message: 'Backup export failed' }); }
}
