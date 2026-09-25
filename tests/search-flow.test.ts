import assert from 'node:assert/strict';
import { parseSearchIntent } from '../lib/ai-search';
import { matchBusinesses } from '../lib/search-matching';

const cases = [
  {
    query: 'Who buys a broken boat and collects it?',
    expectedItem: 'Boat',
    expectedIntent: 'SELL',
    capabilities: ['buys_from_customers', 'buys_damaged_items', 'home_pickup'],
  },
  {
    query: 'Who buys used restaurant equipment in ICAD and can collect it?',
    expectedItem: 'Restaurant equipment',
    expectedZone: 'ICAD',
    expectedIntent: 'SELL',
    capabilities: ['buys_from_customers', 'buys_used_items', 'home_pickup'],
  },
  {
    query: 'عندي دراجات أطفال قديمة في البيت وأبا حد يشيلها',
    expectedItem: 'Kids bicycles',
    expectedIntent: 'REMOVE',
    capabilities: ['home_pickup'],
  },
] as const;

async function main() {
  for (const testCase of cases) {
    const intent = await parseSearchIntent(testCase.query);
    assert.equal(intent.item_type, testCase.expectedItem);
    assert.equal(intent.user_intent, testCase.expectedIntent);
    if ('expectedZone' in testCase) assert.equal(intent.zone, testCase.expectedZone);
    for (const capability of testCase.capabilities) assert.ok(intent.required_capabilities.includes(capability), `${testCase.query}: missing ${capability}`);
  }

  const intent = await parseSearchIntent(cases[0].query);
  const results = matchBusinesses(intent, [
    {
      id: 'dev-compatible', name: 'Development-only compatible business', category: 'Marine',
      itemTypes: ['Boat'], conditions: ['Broken'], activities: ['Buy used items'],
      capabilities: ['buys_from_customers', 'buys_damaged_items', 'home_pickup'], zone: 'M10',
    },
    {
      id: 'dev-incompatible', name: 'Development-only incompatible business', category: 'Marine',
      itemTypes: ['Boat'], conditions: ['Broken'], activities: ['Boat repair'],
      capabilities: ['repairs_items'], zone: 'M10',
    },
  ]);
  assert.deepEqual(results.map((business) => business.id), ['dev-compatible']);
  console.log('search flow tests passed (in-memory development fixtures only)');
}

void main();
