import { SearchIntent } from './ai-search';
import { expandSearchTerms, fuzzySimilarity, normalizeSearchText } from './search-normalization';

export interface BusinessForMatching {
  id: string;
  name: string;
  nameAr?: string;
  description?: string;
  sourceUrl?: string;
  keywords?: string[];
  searchCategories?: string[];
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

function fieldContains(values: Array<string | undefined>, query: string): boolean {
  const wanted = normalizeSearchText(query);
  return Boolean(wanted && values.some((value) => value && normalizeSearchText(value).includes(wanted)));
}

function bestFuzzy(terms: string[], values: Array<string | undefined>): number {
  return terms.reduce((best, term) => Math.max(best, ...values.filter(Boolean).map((value) => fuzzySimilarity(term, value || ''))), 0);
}

export function matchBusinesses(intent: SearchIntent, businesses: BusinessForMatching[], rawQuery = ''): MatchedBusiness[] {
  const terms = rawQuery ? expandSearchTerms(rawQuery) : [];
  return businesses
    .map((business) => {
      const matchedOn: string[] = [];
      const searchable = [business.name, business.nameAr, business.description, business.category, ...(business.searchCategories || []), business.location, business.zone, ...(business.activities || []), ...(business.itemTypes || []), ...(business.conditions || []), ...(business.capabilities || []), ...(business.keywords || [])];
      let score = 0;
      const has = (values: string[] | undefined, wanted: string | null) => Boolean(wanted && values?.some((value) => fieldContains([value], wanted)));

      if (fieldContains([business.name, business.nameAr], rawQuery)) { score += 100; matchedOn.push('exact business name'); }
      if (has(business.itemTypes, intent.item_type)) { score += 35; matchedOn.push('item type'); }
      if (has(business.conditions, intent.item_condition)) { score += 20; matchedOn.push('condition'); }
      if (has(business.activities, intent.business_activity) || fieldContains(business.activities || [], intent.service || '')) { score += 35; matchedOn.push('service/activity'); }
      if (intent.category && fieldContains([business.category, ...(business.searchCategories || [])], intent.category)) { score += 30; matchedOn.push('category'); }
      if (intent.zone && business.zone && normalizeSearchText(business.zone) === normalizeSearchText(intent.zone)) { score += 10; matchedOn.push('zone'); }
      if (intent.open_now && business.isOpen) { score += 10; matchedOn.push('open now'); }
      if (intent.near_me && business.distanceKm !== undefined) { score += Math.max(0, 10 - business.distanceKm); matchedOn.push('near me'); }

      const expandedMatch = terms.length && terms.some((term) => fieldContains(searchable, term));
      if (expandedMatch) { score += 28; matchedOn.push('synonym'); }
      const fuzzyScore = terms.length ? bestFuzzy(terms, searchable) : 0;
      if (fuzzyScore >= .62) { score += fuzzyScore * 24; matchedOn.push('fuzzy'); }

      const missingCapabilities = intent.required_capabilities.filter((capability) => !business.capabilities.some((value) => normalizeSearchText(value).includes(normalizeSearchText(capability))));
      if (missingCapabilities.length) score -= 100;
      else if (intent.required_capabilities.length) { score += 30; matchedOn.push('required capabilities'); }

      // Specific requested item types must be source-backed; a broad category is not enough.
      const missingItemType = Boolean(intent.item_type && !has(business.itemTypes, intent.item_type));
      if (missingItemType) score -= 120;

      return { ...business, matchScore: Math.round(score * 100) / 100, matchedOn, listingLabel: (business.listingType === 'SPONSORED' ? 'SPONSORED' : 'ORGANIC') as 'ORGANIC' | 'SPONSORED' };
    })
    .filter((business) => business.matchScore >= 20)
    .sort((a, b) => b.matchScore - a.matchScore || (b.rating || 0) - (a.rating || 0));
}
