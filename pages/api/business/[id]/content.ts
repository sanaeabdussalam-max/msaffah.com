import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../../../lib/prisma';
import { findPublishedBusinessContent, findOwnerContent } from '../../../../lib/business-content-repository';
import { requireVerifiedBusinessOwner } from '../../../../lib/business-owner-permissions';
import { readOptionalString, readString } from '../../../../lib/api-input';

function ownerId(req: NextApiRequest): string { const value = req.headers['x-masfah-owner-id']; if (typeof value !== 'string' || !value) throw new Error('OWNER_AUTH_REQUIRED'); return value; }

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const businessId = typeof req.query.id === 'string' ? req.query.id : '';
  if (!businessId) return res.status(400).json({ message: 'Business id is required' });
  try {
    if (req.method === 'GET') return res.status(200).json(await findPublishedBusinessContent(businessId));
    const claimantId = ownerId(req); await requireVerifiedBusinessOwner(businessId, claimantId);
    if (req.method === 'POST') {
      const kind = readString(req.body?.kind, 20).toUpperCase();
      if (kind === 'PROJECT') return res.status(201).json(await prisma.businessProject.create({ data: { businessId, ownerId: claimantId, titleEn: readString(req.body.titleEn), titleAr: readOptionalString(req.body.titleAr), descriptionEn: readOptionalString(req.body.descriptionEn, 2000), descriptionAr: readOptionalString(req.body.descriptionAr, 2000), areaLabel: readOptionalString(req.body.areaLabel), projectDate: req.body.projectDate ? new Date(req.body.projectDate) : null, status: 'PENDING_REVIEW' } }));
      if (kind === 'UPDATE') return res.status(201).json(await prisma.businessUpdate.create({ data: { businessId, ownerId: claimantId, titleEn: readString(req.body.titleEn), titleAr: readOptionalString(req.body.titleAr), bodyEn: readString(req.body.bodyEn, 4000), bodyAr: readOptionalString(req.body.bodyAr, 4000), status: 'PENDING_REVIEW' } }));
      return res.status(400).json({ message: 'Unsupported content kind' });
    }
    if (req.method === 'PATCH' || req.method === 'DELETE') {
      const contentId = readString(req.body?.contentId || req.query.contentId, 100); const kind = readString(req.body?.kind || req.query.kind, 20).toUpperCase();
      if (kind === 'PROJECT') {
        const existing = await prisma.businessProject.findFirst({ where: { id: contentId, businessId, ownerId: claimantId } }); if (!existing) return res.status(404).json({ message: 'Project not found' });
        if (req.method === 'DELETE') return res.status(200).json(await prisma.businessProject.update({ where: { id: contentId }, data: { status: 'ARCHIVED' } }));
        return res.status(200).json(await prisma.businessProject.update({ where: { id: contentId }, data: { titleEn: req.body.titleEn ? readString(req.body.titleEn) : undefined, descriptionEn: req.body.descriptionEn ? readString(req.body.descriptionEn, 2000) : undefined, status: 'PENDING_REVIEW' } }));
      }
      const existing = await prisma.businessUpdate.findFirst({ where: { id: contentId, businessId, ownerId: claimantId } }); if (!existing) return res.status(404).json({ message: 'Update not found' });
      if (req.method === 'DELETE') return res.status(200).json(await prisma.businessUpdate.update({ where: { id: contentId }, data: { status: 'ARCHIVED' } }));
      return res.status(200).json(await prisma.businessUpdate.update({ where: { id: contentId }, data: { titleEn: req.body.titleEn ? readString(req.body.titleEn) : undefined, bodyEn: req.body.bodyEn ? readString(req.body.bodyEn, 4000) : undefined, status: 'PENDING_REVIEW' } }));
    }
    return res.status(405).json({ message: 'Method not allowed' });
  } catch (error) { const message = error instanceof Error ? error.message : 'Request failed'; return res.status(message.includes('OWNER') ? 403 : 400).json({ message }); }
}
