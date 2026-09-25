import { prisma } from './prisma';
import { BusinessForMatching } from './search-matching';

const capabilityKinds = new Set(['CAPABILITY']);

/** Reads only approved, published and searchable businesses from Supabase via Prisma. */
export async function findPublishedBusinesses(): Promise<BusinessForMatching[]> {
  const businesses = await prisma.business.findMany({
    where: {
      publicationStatus: 'PUBLISHED',
      isSearchable: true,
    },
    include: {
      locations: { include: { location: true } },
      taxonomies: { include: { taxonomy: true } },
    },
  });

  return businesses.map((business) => {
    const taxonomies = business.taxonomies.map(({ taxonomy }) => taxonomy);
    const locations = business.locations.map(({ location }) => location);
    const capabilities = taxonomies
      .filter((taxonomy) => capabilityKinds.has(taxonomy.kind))
      .flatMap((taxonomy) => [taxonomy.slug, taxonomy.nameEn.toLowerCase().replace(/\s+/g, '_')]);

    return {
      id: business.id,
      name: business.nameEn || business.nameAr,
      category: taxonomies.find((taxonomy) => taxonomy.kind === 'CATEGORY')?.nameEn,
      activities: taxonomies.filter((taxonomy) => taxonomy.kind === 'ACTIVITY').map((taxonomy) => taxonomy.nameEn),
      itemTypes: taxonomies.filter((taxonomy) => taxonomy.kind === 'ITEM_TYPE').map((taxonomy) => taxonomy.nameEn),
      conditions: taxonomies.filter((taxonomy) => taxonomy.kind === 'CONDITION').map((taxonomy) => taxonomy.nameEn),
      capabilities,
      location: locations.find((location) => location.kind !== 'ZONE')?.nameEn,
      zone: locations.find((location) => location.kind === 'ZONE')?.nameEn,
      isOpen: isBusinessOpenNow(business.openingHours),
      rating: business.rating,
      listingType: business.listingType as BusinessForMatching['listingType'],
    } satisfies BusinessForMatching;
  });
}

function isBusinessOpenNow(openingHours: unknown): boolean | undefined {
  // Opening-hours interpretation is intentionally conservative until the admin
  // schedule format is finalized. Unknown schedules are not treated as open.
  if (!openingHours || typeof openingHours !== 'object') return undefined;
  return undefined;
}
