import type { NextApiRequest, NextApiResponse } from 'next';
import { Prisma } from '@prisma/client';
import { prisma } from '../../lib/prisma';

/** Public suggestion intake. Values remain PENDING and are never published automatically. */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ message: 'Method not allowed' });
  const { kind, nameEn, nameAr, sourceText, locationId } = req.body ?? {};
  if (!kind || (!nameEn && !nameAr)) return res.status(400).json({ message: 'kind and a name are required' });
  try {
    const rows = await prisma.$queryRaw<Array<{ id: string; status: string }>>(Prisma.sql`
      INSERT INTO public.taxonomy_suggestions (kind, name_en, name_ar, source_text, location_id, status)
      VALUES (${kind}, ${nameEn || nameAr}, ${nameAr || null}, ${sourceText || null}, ${locationId || null}, 'PENDING')
      RETURNING id, status
    `);
    return res.status(201).json({ id: rows[0].id, status: rows[0].status, published: false });
  } catch { return res.status(500).json({ message: 'Suggestion could not be saved' }); }
}
