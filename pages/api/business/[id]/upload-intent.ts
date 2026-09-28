import type { NextApiRequest, NextApiResponse } from 'next';
import { requireVerifiedBusinessOwner, assertPublishableMedia } from '../../../../lib/business-owner-permissions';
import { storageAdapter } from '../../../../lib/storage/storage-adapter';
import { readString } from '../../../../lib/api-input';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ message: 'Method not allowed' });
  const businessId = typeof req.query.id === 'string' ? req.query.id : ''; const claimantId = typeof req.headers['x-masfah-owner-id'] === 'string' ? req.headers['x-masfah-owner-id'] : '';
  try { await requireVerifiedBusinessOwner(businessId, claimantId); const contentType = readString(req.body?.contentType, 80); const fileName = readString(req.body?.fileName, 200); const fileSize = Number(req.body?.fileSize); assertPublishableMedia({ permissionConfirmed: Boolean(req.body?.permissionConfirmed), contentType, fileSize }); return res.status(200).json(await storageAdapter.createUploadIntent({ businessId, fileName, contentType, fileSize, usageType: readString(req.body?.usageType || 'GALLERY', 30) })); } catch (error) { return res.status(403).json({ message: error instanceof Error ? error.message : 'Upload intent failed' }); }
}
