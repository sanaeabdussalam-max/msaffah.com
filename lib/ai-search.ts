/** MASFAH natural-language intent contract. Taxonomy values come from the database. */
export const AI_INTENT_SYSTEM_PROMPT = `
You are MASFAH, an intelligent local search engine for Musaffah and ICAD.
Interpret Arabic, English and colloquial Arabic by meaning, not exact keywords.
Return strict JSON with arrays where indicated. Never invent a business.

{
  "category": string|null,
  "subcategory": string|null,
  "business_activity": string|null,
  "item_type": string|null,
  "item_condition": string|null,
  "user_intent": "BUY"|"SELL"|"REPAIR"|"REMOVE"|"DISPOSE"|"DONATE"|"EXCHANGE"|"TRANSPORT"|"COLLECT"|null,
  "required_capabilities": string[],
  "service": string|null,
  "product": string|null,
  "location": string|null,
  "zone": string|null,
  "open_now": boolean,
  "near_me": boolean,
  "distance_km": number|null,
  "language": string|null,
  "price_level": number|null,
  "confidence": number,
  "needs_clarification": string[]
}

Map examples semantically:
- "Who buys broken boats and collects them?" => Marine, Boat, damaged/broken, SELL, buys_from_customers + buys_damaged_items + pickup.
- "old curtains ... buy them" => Household, Curtains, used/old, SELL, buys_used_items.
- "old kids bicycles ... take them" => Automotive or Household, Kids bicycles, old/used, REMOVE or SELL, pickup required.
- "old restaurant equipment in ICAD and can collect it" => Restaurant Equipment, old/used, SELL, ICAD, buys_used_items + home_pickup.
`;

export type UserIntent = 'BUY'|'SELL'|'REPAIR'|'REMOVE'|'DISPOSE'|'DONATE'|'EXCHANGE'|'TRANSPORT'|'COLLECT';

export interface SearchIntent {
  category: string | null;
  subcategory: string | null;
  business_activity: string | null;
  item_type: string | null;
  item_condition: string | null;
  user_intent: UserIntent | null;
  required_capabilities: string[];
  service: string | null;
  product: string | null;
  location: string | null;
  zone: string | null;
  open_now: boolean;
  near_me: boolean;
  distance_km: number | null;
  language: string | null;
  price_level: number | null;
  confidence: number;
  needs_clarification: string[];
}

const findItemType = (query: string): string | null => {
  const itemTypes: Array<[string, RegExp]> = [
    ['Boat', /boat|قارب|قوارب/i], ['Curtains', /curtain|ستائر/i], ['Kitchenware', /kitchenware|أدوات مطبخ/i],
    ['Kids bicycles', /kids?\s*bicycles?|دراجات أطفال/i], ['Shoes', /shoes?|أحذية/i], ['Bags', /bags?|شنط/i],
    ['Furniture', /furniture|أثاث/i], ['Restaurant equipment', /restaurant equipment|معدات مطاعم/i],
    ['Car', /car|سيارة/i], ['Electronics', /electronics?|إلكترونيات/i], ['Appliances', /appliances?|أجهزة/i],
    ['Scrap', /scrap|خردة|سكراب/i],
  ];
  return itemTypes.find(([, pattern]) => pattern.test(query))?.[0] ?? null;
};

/** Deterministic fallback parser; replace its provider call without changing the intent contract. */
import { expandSearchTerms, normalizeSearchText } from './search-normalization';

export async function parseSearchIntent(query: string): Promise<SearchIntent> {
  const normalized = query.trim();
  const expanded = expandSearchTerms(query).join(' ');
  const explicitSell = /buy|buys|buyer|sell|selling|يشتر|أشتري|يشتري|يبيع/i.test(normalized);
  const explicitRemove = /remove|dispose|take away|collect|collection|pickup|pick up|من البيت|استلام|يشيل|ياخذ|يتخلص|يلم|يجي البيت|ييون البيت/i.test(normalized);
  const repair = /repair|fix|تصليح|يصلح|إصلاح/i.test(normalized);
  const synonymCategory = /boat|marine|قارب|قوارب|بوت|بحري/i.test(expanded) ? 'Marine' : /garage|workshop|كراج|جراج|ورشة/i.test(expanded) ? 'Automotive' : /tyre|tire|تاير|تواير|إطارات/i.test(expanded) ? 'Automotive' : /scrap|سكراب|خردة/i.test(expanded) ? 'Scrap' : /aluminium|aluminum|المنيوم|ألمنيوم/i.test(expanded) ? 'Building & Materials' : null;
  const pickup = explicitRemove;
  const used = /used|old|second hand|مستعمل|قديم|خردة|سكراب/i.test(normalized);
  const broken = /broken|damaged|مكسور|خربان|تالف/i.test(normalized);
  const itemType = findItemType(normalized);
  const zone = normalized.match(/\bM\s*\d+\b|ICAD(?:\s+[IV]+)?/i)?.[0]?.replace(/\s+/g, ' ').toUpperCase() ?? null;
  const userIntent: UserIntent | null = repair ? 'REPAIR' : explicitRemove && !explicitSell ? 'REMOVE' : explicitSell ? 'SELL' : null;
  const capabilities = [
    ...(explicitSell ? ['buys_from_customers'] : []),
    ...(used ? ['buys_used_items'] : []),
    ...(broken ? ['buys_damaged_items'] : []),
    ...(pickup ? ['home_pickup'] : []),
    ...(repair ? ['repairs_items'] : []),
  ];

  return {
    category: synonymCategory || (/boat|marine|قارب|قوارب|بحرية/i.test(normalized) ? 'Marine' : null),
    subcategory: null,
    business_activity: explicitSell ? (used ? 'Buy used items' : 'Buy items') : repair ? 'Repair items' : pickup ? 'Item removal' : null,
    item_type: itemType,
    item_condition: broken ? 'Broken' : used ? 'Used' : null,
    user_intent: userIntent,
    required_capabilities: capabilities,
    service: repair ? 'Repair' : null,
    product: null,
    location: /musaffah|مصفح/i.test(normalized) ? 'Musaffah' : /ICAD/i.test(normalized) ? 'ICAD' : null,
    zone,
    open_now: /open now|now|الحين|فاتح/i.test(normalized),
    near_me: /near me|nearby|قريب|حول/i.test(normalized),
    distance_km: null,
    language: /urdu|أردو|اردو/i.test(normalized) ? 'Urdu' : null,
    price_level: /cheap|رخيص/i.test(normalized) ? 1 : null,
    confidence: itemType || userIntent || synonymCategory ? 0.78 : 0.35,
    needs_clarification: itemType && userIntent ? [] : ['Confirm item and required action'],
  };
}
