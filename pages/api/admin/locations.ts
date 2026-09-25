import type { NextApiRequest, NextApiResponse } from 'next';
import { requireAdmin } from '../../../lib/admin-auth';
import { listLocations } from '../../../lib/supabase-admin-repository';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try { requireAdmin(req); } catch { return res.status(401).json({ message: 'Unauthorized' }); }
  try {
    if (req.method === 'GET') return res.status(200).json(await listLocations());
    return res.status(501).json({ message: 'Location writes are not enabled in this Beta screen yet.' });
  } catch { return res.status(500).json({ message: 'Location operation failed' }); }
}
