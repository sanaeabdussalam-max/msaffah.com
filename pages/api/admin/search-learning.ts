import type { NextApiRequest, NextApiResponse } from 'next';
import { getLearningSuggestions } from '../../../lib/search-learning';
import { requireAdmin } from '../../../lib/admin-auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') return res.status(405).json({ message: 'Method not allowed' });
  try { requireAdmin(req); return res.status(200).json(await getLearningSuggestions()); } catch (error) { return res.status(error instanceof Error && error.message === 'ADMIN_UNAUTHORIZED' ? 401 : 500).json({ message: error instanceof Error ? error.message : 'Failed to load search learning' }); }
}
