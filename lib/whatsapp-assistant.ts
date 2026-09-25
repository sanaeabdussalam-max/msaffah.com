import { SearchIntent } from './ai-search';

export type AssistantAction = 'SEARCH' | 'ASK_FOLLOW_UP' | 'CREATE_QUOTE' | 'HUMAN_HANDOFF' | 'NO_MATCH';

export interface AssistantDecision {
  action: AssistantAction;
  reason: string;
  question?: string;
}

/**
 * Provider-neutral orchestration contract for the future WhatsApp assistant.
 * A WhatsApp webhook can call this function after persisting the inbound message.
 */
export function decideAssistantAction(intent: SearchIntent, userRequestedHuman = false): AssistantDecision {
  if (userRequestedHuman) return { action: 'HUMAN_HANDOFF', reason: 'USER_REQUESTED' };
  if (intent.confidence < 0.55) return { action: 'HUMAN_HANDOFF', reason: 'LOW_CONFIDENCE' };
  if (intent.needs_clarification.length > 0) {
    return {
      action: 'ASK_FOLLOW_UP',
      reason: 'MISSING_REQUIRED_INFORMATION',
      question: intent.needs_clarification[0],
    };
  }
  if (intent.user_intent === 'SELL' || intent.user_intent === 'BUY' || intent.user_intent === 'REPAIR') {
    return { action: 'SEARCH', reason: 'SEARCHABLE_INTENT' };
  }
  return { action: 'NO_MATCH', reason: 'UNSUPPORTED_OR_UNCLEAR_INTENT' };
}

export function shouldReturnSponsoredLabel(listingType?: string): boolean {
  return listingType === 'SPONSORED';
}

/** No provider SDK, credentials, outbound request, or message sending is enabled here. */
export const WHATSAPP_INTEGRATION_STATUS = 'DISABLED';
