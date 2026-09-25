import crypto from 'node:crypto';
import { Prisma } from '@prisma/client';
import { prisma } from './prisma';

/** Produces an encrypted JSON export in memory; caller must send it to private storage. */
export async function createEncryptedPublicDataExport(): Promise<Buffer> {
  const keyText = process.env.MASFAH_BACKUP_KEY;
  if (!keyText) throw new Error('MASFAH_BACKUP_KEY is not configured');
  const key = crypto.createHash('sha256').update(keyText).digest();
  const iv = crypto.randomBytes(12);
  const [businesses, locations, taxonomies] = await Promise.all([
    prisma.$queryRaw(Prisma.sql`SELECT id, name_en, name_ar, slug, description_en, description_ar, is_verified, tier, listing_type, publication_status, is_searchable, rating, review_count, phone, whatsapp, opening_hours, price_level, latitude, longitude, created_at, updated_at FROM public.businesses WHERE publication_status = 'PUBLISHED'`),
    prisma.$queryRaw(Prisma.sql`SELECT id, parent_id, name_ar, name_en, type, slug, kind, is_active, sort_order, created_at, updated_at FROM public.locations WHERE is_active = true`),
    prisma.$queryRaw(Prisma.sql`SELECT id, kind, name_en, name_ar, slug, parent_id, is_other, is_active, sort_order, created_at, updated_at FROM public.taxonomies WHERE is_active = true`),
  ]);
  const payload = { exportedAt: new Date().toISOString(), businesses, locations, taxonomies };
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
  const ciphertext = Buffer.concat([cipher.update(JSON.stringify(payload), 'utf8'), cipher.final()]);
  return Buffer.concat([Buffer.from('MASFAH-BACKUP-V1\n'), iv, cipher.getAuthTag(), ciphertext]);
}
