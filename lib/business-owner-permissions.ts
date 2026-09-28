import { prisma } from './prisma';

export async function requireVerifiedBusinessOwner(businessId: string, claimantId: string): Promise<void> {
  const business = await prisma.business.findFirst({
    where: { id: businessId, isVerified: true, claims: { some: { claimantId, status: 'APPROVED' } } },
    select: { id: true },
  });
  if (!business) throw new Error('BUSINESS_OWNER_VERIFICATION_REQUIRED');
}

export function assertPublishableMedia(input: { permissionConfirmed: boolean; contentType: string; fileSize: number }): void {
  if (!input.permissionConfirmed) throw new Error('MEDIA_PERMISSION_REQUIRED');
  if (!['image/jpeg', 'image/png', 'image/webp'].includes(input.contentType)) throw new Error('MEDIA_TYPE_NOT_ALLOWED');
  if (input.fileSize <= 0 || input.fileSize > 10 * 1024 * 1024) throw new Error('MEDIA_SIZE_NOT_ALLOWED');
}
