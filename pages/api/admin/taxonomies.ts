import type { NextApiRequest, NextApiResponse } from 'next';
import { requireAdmin } from '../../../lib/admin-auth';
import { createTaxonomy, deactivateTaxonomy, listTaxonomies, updateTaxonomy } from '../../../lib/supabase-admin-repository';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try { requireAdmin(req); } catch { return res.status(401).json({ message: 'Unauthorized' }); }
  try {
    if (req.method === 'GET') return res.status(200).json(await listTaxonomies(typeof req.query.kind === 'string' ? req.query.kind : undefined));
    if (req.method === 'POST') {
      const { kind, nameEn, nameAr, slug, parentId, isOther } = req.body ?? {};
      if (!kind || !nameEn || !nameAr || !slug) return res.status(400).json({ message: 'kind, names and slug are required' });
      return res.status(201).json(await createTaxonomy({ kind, nameEn, nameAr, slug, parentId, isOther }));
    }
    const id = typeof req.query.id === 'string' ? req.query.id : req.body?.id;
    if (!id) return res.status(400).json({ message: 'id is required' });
    if (req.method === 'DELETE') return res.status(200).json(await deactivateTaxonomy(id));
    if (req.method === 'PATCH') {
      const { nameEn, nameAr, slug, parentId, isActive, sortOrder } = req.body ?? {};
      return res.status(200).json(await updateTaxonomy(id, { nameEn, nameAr, slug, parentId, isActive, sortOrder }));
    }
    return res.status(405).json({ message: 'Method not allowed' });
  } catch (error) { console.error('taxonomy admin error', error); return res.status(500).json({ message: 'Admin operation failed' }); }
}
