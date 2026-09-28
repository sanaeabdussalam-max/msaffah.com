import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../../../lib/prisma';
import { readOptionalString, readString } from '../../../../lib/api-input';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const businessId = typeof req.query.id === 'string' ? req.query.id : '';
  if (req.method !== 'POST') return res.status(405).json({ message: 'Method not allowed' });
  try {
    const mediaId = readString(req.body?.mediaId, 100); const reason = readString(req.body?.reason, 80); const details = readOptionalString(req.body?.details, 1000);
    const report = await prisma.businessMediaReport.create({ data: { businessId, mediaId, reason, details, reporterId: typeof req.headers['x-masfah-reporter-id'] === 'string' ? req.headers['x-masfah-reporter-id'] : null } });
    return res.status(201).json({ id: report.id, status: report.status });
  } catch (error) { return res.status(400).json({ message: error instanceof Error ? error.message : 'Report failed' }); }
}
