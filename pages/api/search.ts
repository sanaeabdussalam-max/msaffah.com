import { NextApiRequest, NextApiResponse } from 'next';
import { parseSearchIntent } from '../../lib/ai-search';
import { matchBusinesses } from '../../lib/search-matching';
import { findPublishedBusinesses } from '../../lib/supabase-public-repository';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') return res.status(405).json({ message: 'Method not allowed' });
  const { q } = req.query;
  if (!q || typeof q !== 'string') return res.status(400).json({ message: 'Search query is required' });

  try {
    const intent = await parseSearchIntent(q);
    const businesses = await findPublishedBusinesses();
    const results = matchBusinesses(intent, businesses);
    return res.status(200).json({ intent, results, total: results.length });
  } catch (error) {
    console.error('Search error:', error);
    return res.status(503).json({ message: 'Search data source is unavailable in this environment' });
  }
}
