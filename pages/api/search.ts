import { NextApiRequest, NextApiResponse } from 'next';
import { parseSearchIntent } from '../../lib/ai-search';
import { matchBusinesses } from '../../lib/search-matching';
import { findPublishedBusinesses } from '../../lib/supabase-public-repository';
import { recordSearchEvent } from '../../lib/search-learning';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') return res.status(405).json({ message: 'Method not allowed' });
  const { q } = req.query;
  if (!q || typeof q !== 'string') return res.status(400).json({ message: 'Search query is required' });

  try {
    const intent = await parseSearchIntent(q);
    const businesses = await findPublishedBusinesses();
    const results = matchBusinesses(intent, businesses, q);
    await recordSearchEvent({ query: q, resultCount: results.length, sessionKey: typeof req.headers['x-search-session'] === 'string' ? req.headers['x-search-session'] : undefined, userAgent: req.headers['user-agent'] });
    const relatedSuggestions = results.length === 0 && intent.item_type === 'Pontoon'
      ? [
          { label: 'إصلاح القوارب والفايبرجلاس', query: 'أبا حد يصلح القارب أو الفايبرجلاس' },
          { label: 'بناء وصيانة القوارب', query: 'boat building and marine repair' },
        ]
      : [];
    return res.status(200).json({ intent, results, total: results.length, relatedSuggestions });
  } catch (error) {
    console.error('Search error:', error);
    return res.status(503).json({ message: 'Search data source is unavailable in this environment' });
  }
}
