export interface TaxonomyCandidate {
  id: string;
  kind: string;
  nameEn: string;
  nameAr?: string;
  aliases?: string[];
}

export interface SuggestionReview {
  action: 'APPROVE' | 'EDIT' | 'REJECT' | 'MERGE' | 'MAP_EXISTING';
  targetId?: string;
  editedNameEn?: string;
  editedNameAr?: string;
  reviewerNote?: string;
}

const normalize = (value: string) => value.toLocaleLowerCase().normalize('NFKD').replace(/[\u0300-\u036f]/g, '').replace(/[^\p{L}\p{N}]+/gu, ' ').trim();

/** Lightweight fuzzy warning before an admin approves a new value. */
export function findSimilarTaxonomies(input: string, candidates: TaxonomyCandidate[], threshold = 0.72): TaxonomyCandidate[] {
  const needle = normalize(input);
  if (!needle) return [];
  return candidates.filter((candidate) => {
    const values = [candidate.nameEn, candidate.nameAr, ...(candidate.aliases ?? [])].filter((value): value is string => Boolean(value)).map(normalize);
    return values.some((value) => value === needle || value.includes(needle) || needle.includes(value) || tokenOverlap(needle, value) >= threshold);
  });
}

function tokenOverlap(a: string, b: string): number {
  const left = new Set(a.split(' '));
  const right = new Set(b.split(' '));
  const intersection = [...left].filter((token) => right.has(token)).length;
  return intersection / Math.max(left.size, right.size, 1);
}

export function validateSuggestionReview(review: SuggestionReview): string[] {
  const errors: string[] = [];
  if (review.action === 'MERGE' || review.action === 'MAP_EXISTING') {
    if (!review.targetId) errors.push('A target taxonomy is required.');
  }
  if (review.action === 'EDIT' && !review.editedNameEn?.trim() && !review.editedNameAr?.trim()) {
    errors.push('An edited Arabic or English value is required.');
  }
  return errors;
}
