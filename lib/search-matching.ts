import { SearchIntent } from './ai-search';

export interface BusinessForMatching {
  id: string;
  name: string;
  category?: string;
  activities?: string[];
  itemTypes?: string[];
  conditions?: string[];
  capabilities: string[];
  location?: string;
  zone?: string;
  distanceKm?: number;
  isOpen?: boolean;
  rating?: number;
  listingType?: 'ORGANIC' | 'FEATURED' | 'SPONSORED';
}

export interface MatchedBusiness extends BusinessForMatching {
  matchScore: number;
  matchedOn: string[];
  listingLabel: 'ORGANIC' | 'SPONSORED';
}

/**
 * Capability-first matching: a business is not returned as relevant just
 * because it shares a category; required actions must be supported.
 */
export function matchBusinesses(intent: SearchIntent, businesses: BusinessForMatching[]): MatchedBusiness[] {
  return businesses
    .map((business) => {
      const matchedOn: string[] = [];
      let score = 0;
      const has = (values: string[] | undefined, wanted: string | null) =>
        Boolean(wanted && values?.some((value) => value.toLowerCase().includes(wanted.toLowerCase())));

      if (has(business.itemTypes, intent.item_type)) { score += 35; matchedOn.push('item type'); }
      if (has(business.conditions, intent.item_condition)) { score += 20; matchedOn.push('condition'); }
      if (has(business.activities, intent.business_activity)) { score += 20; matchedOn.push('activity'); }
      if (intent.category && business.category?.toLowerCase().includes(intent.category.toLowerCase())) { score += 10; matchedOn.push('category'); }
      if (intent.zone && business.zone?.toUpperCase() === intent.zone.toUpperCase()) { score += 10; matchedOn.push('zone'); }
      if (intent.open_now && business.isOpen) { score += 10; matchedOn.push('open now'); }
      if (intent.near_me && business.distanceKm !== undefined) { score += Math.max(0, 10 - business.distanceKm); matchedOn.push('near me'); }

      const missingCapabilities = intent.required_capabilities.filter((capability) => !business.capabilities.includes(capability));
      if (missingCapabilities.length) score -= 100;
      else if (intent.required_capabilities.length) { score += 30; matchedOn.push('required capabilities'); }

      return {
        ...business,
        matchScore: score,
        matchedOn,
        listingLabel: (business.listingType === 'SPONSORED' ? 'SPONSORED' : 'ORGANIC') as 'ORGANIC' | 'SPONSORED',
      };
    })
    .filter((business) => business.matchScore >= 20)
    .sort((a, b) => b.matchScore - a.matchScore);
}
