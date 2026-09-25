import type { NextApiRequest, NextApiResponse } from 'next';
import { requireAdmin } from '../../../lib/admin-auth';
import { listPendingSuggestions, reviewSuggestion } from '../../../lib/supabase-admin-repository';
import { validateSuggestionReview } from '../../../lib/taxonomy-suggestions';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try { requireAdmin(req); } catch { return res.status(401).json({ message: 'Unauthorized' }); }
  try {
    if (req.method === 'GET') return res.status(200).json(await listPendingSuggestions());
    if (req.method !== 'POST') return res.status(405).json({ message: 'Method not allowed' });
    const { id, action, targetId, editedNameEn, editedNameAr, reviewerNote } = req.body ?? {};
    const errors = validateSuggestionReview({ action, targetId, editedNameEn, editedNameAr, reviewerNote });
    if (!id || errors.length) return res.status(400).json({ message: 'Invalid review', errors });
    const reviewed = await reviewSuggestion({ id, action, targetId, editedNameEn, editedNameAr, reviewerNote });
    if (!reviewed) return res.status(404).json({ message: 'Suggestion not found' });
    return res.status(200).json(reviewed);
  } catch { return res.status(500).json({ message: 'Suggestion review failed' }); }
}
