import assert from 'node:assert/strict';
import { parseSearchIntent } from '../lib/ai-search';
import { matchBusinesses } from '../lib/search-matching';
import { expandSearchTerms, fuzzySimilarity } from '../lib/search-normalization';
import { isLikelyBot, learningConfidence, learningPolicy } from '../lib/search-learning';

const businesses = [
  { id: 'boat', name: 'Marine Boat Repair', nameAr: 'إصلاح قوارب', category: 'Marine', activities: ['Repair items'], itemTypes: ['Boat'], conditions: [], capabilities: ['repairs_items'], keywords: ['بوت', 'boat'] },
  { id: 'garage', name: 'Musaffah Garage', nameAr: 'كراج مصفح', category: 'Automotive', activities: ['Tyre service'], itemTypes: ['Tyres'], conditions: [], capabilities: ['home_pickup'], keywords: ['تاير', 'tyres', 'garage'] },
  { id: 'scrap', name: 'Scrap Buyer', nameAr: 'مشتري سكراب', category: 'Scrap', activities: ['Buy used items'], itemTypes: ['Scrap'], conditions: ['Used'], capabilities: ['buys_from_customers', 'buys_used_items'], keywords: ['سكراب', 'scrap'] },
];

async function main() {
  const queries = ['بوت', 'قارب', 'boat', 'كراج', 'garage', 'تاير', 'tyres', 'سكراب', 'scrap', 'المنيوم', 'aluminum', 'أبا حد يصلح البوت', 'أبغي كراج يي البيت', 'وين أبيع سكراب', 'tyres near Musaffah'];
  for (const query of queries) { const intent = await parseSearchIntent(query); const results = matchBusinesses(intent, businesses, query); assert.ok(intent.confidence >= .35, query); if (['بوت', 'قارب', 'boat'].includes(query)) assert.equal(results[0]?.id, 'boat'); if (['كراج', 'garage', 'تاير', 'tyres'].includes(query)) assert.equal(results[0]?.id, 'garage'); if (['سكراب', 'scrap', 'وين أبيع سكراب'].includes(query)) assert.equal(results[0]?.id, 'scrap'); }
  assert.ok(expandSearchTerms('بوت').includes('boat'));
  assert.ok(fuzzySimilarity('alumnium', 'aluminium') > .7);
  assert.equal(isLikelyBot('Mozilla Puppeteer'), true);
  assert.equal(isLikelyBot('Mozilla/5.0 Safari'), false);
  assert.equal(learningConfidence(4, 3, 3), 0);
  assert.ok(learningConfidence(8, 8, 7) >= learningPolicy.minConfidence);
  console.log('local search, UAE terminology, fuzzy matching and learning policy tests passed');
}
void main();
