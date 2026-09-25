import type { NextApiRequest, NextApiResponse } from 'next';
import { Prisma } from '@prisma/client';
import { requireAdmin } from '../../../lib/admin-auth';
import { prisma } from '../../../lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try { requireAdmin(req); } catch { return res.status(401).json({ message: 'Unauthorized' }); }
  try {
    if (req.method === 'GET') {
      const rows = await prisma.$queryRaw(Prisma.sql`
        SELECT id, name_en, name_ar, slug, publication_status, is_searchable, verification_status, created_at, updated_at
        FROM public.businesses ORDER BY created_at DESC
      `);
      return res.status(200).json(rows);
    }
    if (req.method !== 'POST') return res.status(405).json({ message: 'Method not allowed' });
    const { nameEn, nameAr, slug, phone, descriptionEn, descriptionAr } = req.body ?? {};
    if (!nameEn || !nameAr) return res.status(400).json({ message: 'English and Arabic names are required' });
    const rows = await prisma.$queryRaw<Array<Record<string, unknown>>>(Prisma.sql`
      INSERT INTO public.businesses
        (name_en, name_ar, slug, phone, description_en, description_ar, publication_status, is_searchable, verification_status, is_verified)
      VALUES
        (${nameEn}, ${nameAr}, ${slug || null}, ${phone || null}, ${descriptionEn || null}, ${descriptionAr || null}, 'DRAFT', false, 'pending', false)
      RETURNING id, name_en, name_ar, slug, publication_status, is_searchable, verification_status, created_at, updated_at
    `);
    return res.status(201).json(rows[0]);
  } catch (error) { console.error('business admin error', error); return res.status(500).json({ message: 'Business operation failed' }); }
}
