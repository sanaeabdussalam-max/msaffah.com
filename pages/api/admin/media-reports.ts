import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../../lib/prisma';
import { requireAdmin } from '../../../lib/admin-auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    requireAdmin(req);
    if (req.method === 'GET') return res.status(200).json(await prisma.businessMediaReport.findMany({ include: { media: true, business: { select: { nameEn: true, nameAr: true, slug: true } } }, orderBy: { createdAt: 'desc' } }));
    if (req.method === 'PATCH') { const id = typeof req.body?.id === 'string' ? req.body.id : ''; const status = typeof req.body?.status === 'string' ? req.body.status : 'UNDER_REVIEW'; return res.status(200).json(await prisma.businessMediaReport.update({ where: { id }, data: { status, reviewerNote: typeof req.body?.reviewerNote === 'string' ? req.body.reviewerNote : undefined, reviewedAt: new Date() } })); }
    return res.status(405).json({ message: 'Method not allowed' });
  } catch (error) { return res.status(error instanceof Error && error.message === 'ADMIN_UNAUTHORIZED' ? 401 : 400).json({ message: error instanceof Error ? error.message : 'Failed to process report' }); }
}
