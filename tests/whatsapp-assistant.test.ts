import assert from 'node:assert/strict';
import { parseSearchIntent } from '../lib/ai-search';
import { decideAssistantAction, shouldReturnSponsoredLabel, WHATSAPP_INTEGRATION_STATUS } from '../lib/whatsapp-assistant';

async function main() {
  const intent = await parseSearchIntent('Who buys broken boats and collects them?');
  assert.equal(decideAssistantAction(intent).action, 'SEARCH');
  assert.equal(shouldReturnSponsoredLabel('SPONSORED'), true);
  assert.equal(shouldReturnSponsoredLabel('ORGANIC'), false);
  assert.equal(WHATSAPP_INTEGRATION_STATUS, 'DISABLED');

  const unclear = await parseSearchIntent('I need help with something');
  assert.equal(decideAssistantAction(unclear).action, 'HUMAN_HANDOFF');
  assert.equal(decideAssistantAction(intent, true).reason, 'USER_REQUESTED');
  console.log('WhatsApp assistant orchestration tests passed; integration remains disabled');
}

void main();
