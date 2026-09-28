import { prisma } from './prisma';

export async function findPublishedBusinessContent(businessId: string) {
  const [projects, updates, gallery] = await Promise.all([
    prisma.businessProject.findMany({ where: { businessId, status: 'PUBLISHED' }, include: { media: true }, orderBy: [{ projectDate: 'desc' }, { createdAt: 'desc' }] }),
    prisma.businessUpdate.findMany({ where: { businessId, status: 'PUBLISHED' }, include: { media: true }, orderBy: [{ publishedAt: 'desc' }, { createdAt: 'desc' }] }),
    prisma.businessMediaAsset.findMany({ where: { businessId, status: 'PUBLISHED', usageType: 'GALLERY' }, orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }] }),
  ]);
  return { projects, updates, gallery };
}

export async function findOwnerContent(businessId: string, ownerId: string) {
  return prisma.business.findFirst({
    where: { id: businessId, isVerified: true, claims: { some: { claimantId: ownerId, status: 'APPROVED' } } },
    include: { projects: { include: { media: true }, orderBy: { updatedAt: 'desc' } }, updates: { include: { media: true }, orderBy: { updatedAt: 'desc' } }, mediaAssets: { orderBy: { updatedAt: 'desc' } } },
  });
}
