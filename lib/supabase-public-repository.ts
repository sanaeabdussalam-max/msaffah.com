import { Prisma } from '@prisma/client';
import { prisma } from './prisma';
import { BusinessForMatching } from './search-matching';

export async function findPublishedBusinesses(): Promise<BusinessForMatching[]> {
  const businesses = await prisma.$queryRaw<Array<{
    id: string; name_en: string; name_ar: string; category_name: string | null;
    location_name: string | null; location_type: string | null; rating: number; listing_type: string;
  }>>(Prisma.sql`
    SELECT b.id, b.name_en, b.name_ar, c.name_en AS category_name,
           l.name_en AS location_name, l.type AS location_type,
           b.rating, b.listing_type
    FROM public.businesses b
    LEFT JOIN public.categories c ON c.id = b.category_id
    LEFT JOIN public.locations l ON l.id = b.location_id
    WHERE b.publication_status = 'PUBLISHED' AND b.is_searchable = true
    ORDER BY b.rating DESC, b.name_en ASC
  `);

  return businesses.map((business) => ({
    id: business.id,
    name: business.name_en || business.name_ar,
    category: business.category_name ?? undefined,
    activities: [],
    itemTypes: [],
    conditions: [],
    capabilities: [],
    location: business.location_name ?? undefined,
    zone: business.location_type === 'ZONE' ? business.location_name ?? undefined : undefined,
    rating: Number(business.rating ?? 0),
    listingType: (business.listing_type === 'SPONSORED' ? 'SPONSORED' : business.listing_type === 'FEATURED' ? 'FEATURED' : 'ORGANIC') as BusinessForMatching['listingType'],
  }));
}
