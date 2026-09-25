import { Prisma } from '@prisma/client';
import { prisma } from './prisma';

export interface AdminTaxonomy { id: string; kind: string; name_en: string; name_ar: string; slug: string; parent_id: string | null; is_other: boolean; is_active: boolean; sort_order: number; }
export interface AdminLocation { id: string; parent_id: string | null; name_ar: string; name_en: string; type: string; slug: string | null; kind: string | null; is_active: boolean; sort_order: number; }
export interface AdminSuggestion { id: string; kind: string; name_en: string; name_ar: string | null; source_text: string | null; location_id: string | null; matched_taxonomy_id: string | null; status: string; reviewer_note: string | null; created_at: Date; }

export async function listTaxonomies(kind?: string): Promise<AdminTaxonomy[]> {
  return prisma.$queryRaw<AdminTaxonomy[]>(Prisma.sql`
    SELECT id, kind, name_en, name_ar, slug, parent_id, is_other, is_active, sort_order
    FROM public.taxonomies
    WHERE (${kind ?? null}::text IS NULL OR kind = ${kind ?? null})
    ORDER BY sort_order ASC, name_en ASC
  `);
}

export async function createTaxonomy(input: { kind: string; nameEn: string; nameAr: string; slug: string; parentId?: string | null; isOther?: boolean }) {
  const rows = await prisma.$queryRaw<AdminTaxonomy[]>(Prisma.sql`
    INSERT INTO public.taxonomies (kind, name_en, name_ar, slug, parent_id, is_other)
    VALUES (${input.kind}, ${input.nameEn}, ${input.nameAr}, ${input.slug}, ${input.parentId ?? null}, ${input.isOther ?? false})
    RETURNING id, kind, name_en, name_ar, slug, parent_id, is_other, is_active, sort_order
  `);
  return rows[0];
}

export async function updateTaxonomy(id: string, input: Partial<{ nameEn: string; nameAr: string; slug: string; parentId: string | null; isActive: boolean; sortOrder: number }>) {
  const rows = await prisma.$queryRaw<AdminTaxonomy[]>(Prisma.sql`
    UPDATE public.taxonomies
    SET name_en = COALESCE(${input.nameEn ?? null}, name_en),
        name_ar = COALESCE(${input.nameAr ?? null}, name_ar),
        slug = COALESCE(${input.slug ?? null}, slug),
        parent_id = COALESCE(${input.parentId ?? null}, parent_id),
        is_active = COALESCE(${input.isActive ?? null}, is_active),
        sort_order = COALESCE(${input.sortOrder ?? null}, sort_order),
        updated_at = now()
    WHERE id = ${id}
    RETURNING id, kind, name_en, name_ar, slug, parent_id, is_other, is_active, sort_order
  `);
  return rows[0];
}

export async function deactivateTaxonomy(id: string) {
  return updateTaxonomy(id, { isActive: false });
}

export async function listLocations(): Promise<AdminLocation[]> {
  return prisma.$queryRaw<AdminLocation[]>(Prisma.sql`
    SELECT id, parent_id, name_ar, name_en, type, slug, kind, is_active, sort_order
    FROM public.locations ORDER BY sort_order ASC, name_en ASC
  `);
}

export async function listPendingSuggestions(): Promise<AdminSuggestion[]> {
  return prisma.$queryRaw<AdminSuggestion[]>(Prisma.sql`
    SELECT id, kind, name_en, name_ar, source_text, location_id, matched_taxonomy_id,
           status, reviewer_note, created_at
    FROM public.taxonomy_suggestions
    WHERE status = 'PENDING'
    ORDER BY created_at ASC
  `);
}

export async function reviewSuggestion(input: { id: string; action: string; targetId?: string; editedNameEn?: string; editedNameAr?: string; reviewerNote?: string }) {
  return prisma.$transaction(async (tx) => {
    const suggestions = await tx.$queryRaw<AdminSuggestion[]>(Prisma.sql`SELECT * FROM public.taxonomy_suggestions WHERE id = ${input.id} LIMIT 1`);
    const suggestion = suggestions[0];
    if (!suggestion) return null;
    let matchedTaxonomyId = input.targetId ?? null;
    let status = input.action === 'REJECT' ? 'REJECTED' : input.action === 'MERGE' ? 'MERGED' : 'APPROVED';
    if (input.action === 'APPROVE' || input.action === 'EDIT') {
      const nameEn = input.editedNameEn?.trim() || suggestion.name_en;
      const nameAr = input.editedNameAr?.trim() || suggestion.name_ar || nameEn;
      const slug = nameEn.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || `suggestion-${suggestion.id}`;
      const created = await tx.$queryRaw<Array<{ id: string }>>(Prisma.sql`
        INSERT INTO public.taxonomies (kind, name_en, name_ar, slug)
        VALUES (${suggestion.kind}, ${nameEn}, ${nameAr}, ${slug})
        RETURNING id
      `);
      matchedTaxonomyId = created[0]?.id ?? null;
      status = input.action === 'EDIT' ? 'EDITED' : 'APPROVED';
    }
    const updated = await tx.$queryRaw<AdminSuggestion[]>(Prisma.sql`
      UPDATE public.taxonomy_suggestions
      SET status = ${status}, matched_taxonomy_id = ${matchedTaxonomyId}, reviewer_note = ${input.reviewerNote ?? null}, reviewed_at = now(), updated_at = now()
      WHERE id = ${input.id}
      RETURNING id, kind, name_en, name_ar, source_text, location_id, matched_taxonomy_id, status, reviewer_note, created_at
    `);
    return updated[0];
  });
}
