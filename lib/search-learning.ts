import { prisma } from './prisma';
import { normalizeSearchText } from './search-normalization';

const MIN_INTERACTIONS = 5;
const MIN_SESSIONS = 3;
const MIN_CONFIDENCE = 0.72;
const BOT_SIGNATURES = ['headlesschrome', 'phantomjs', 'selenium', 'puppeteer', 'spider', 'crawler', 'bot'];

export interface SearchEventInput {
  query: string;
  resultCount: number;
  sessionKey?: string;
  userAgent?: string;
  selectedBusinessId?: string;
}

export function isLikelyBot(userAgent = ''): boolean {
  const value = userAgent.toLowerCase();
  return BOT_SIGNATURES.some((signature) => value.includes(signature));
}

export function learningConfidence(interactions: number, sessions: number, selected: number): number {
  if (interactions < MIN_INTERACTIONS || sessions < MIN_SESSIONS) return 0;
  return Math.min(0.99, (selected / Math.max(interactions, 1)) * Math.min(1, sessions / 8));
}

export async function recordSearchEvent(input: SearchEventInput): Promise<void> {
  const normalizedQuery = normalizeSearchText(input.query);
  if (!normalizedQuery || isLikelyBot(input.userAgent)) return;
  await prisma.searchEvent.create({ data: {
    rawQuery: input.query.slice(0, 500), normalizedQuery, resultCount: Math.max(0, input.resultCount),
    sessionKey: input.sessionKey?.slice(0, 160) || null, userAgentHash: input.userAgent ? String(input.userAgent.length) : null,
    selectedBusinessId: input.selectedBusinessId || null, isZeroResult: input.resultCount === 0,
  } });
}

export async function recordSearchSelection(eventId: string, businessId: string): Promise<void> {
  await prisma.searchSelection.create({ data: { searchEventId: eventId, businessId } });
}

export async function getLearningSuggestions() {
  const rows = await prisma.searchEvent.groupBy({ by: ['normalizedQuery'], _count: { _all: true }, where: { isZeroResult: true }, orderBy: { _count: { normalizedQuery: 'desc' } }, take: 100 });
  return rows.map((row) => ({ normalizedQuery: row.normalizedQuery, interactions: row._count._all, confidenceScore: 0, eligible: row._count._all >= MIN_INTERACTIONS }));
}

export const learningPolicy = { minInteractions: MIN_INTERACTIONS, minSessions: MIN_SESSIONS, minConfidence: MIN_CONFIDENCE };
