export function normalizeSearchText(value: string): string {
  return value.trim().toLocaleLowerCase('en-AE').normalize('NFKC')
    .replace(/[\u064B-\u065F]/g, '')
    .replace(/[إأآٱ]/g, 'ا').replace(/ى/g, 'ي').replace(/ة/g, 'ه').replace(/ؤ/g, 'و').replace(/ئ/g, 'ي')
    .replace(/[.,/\\()\-_]+/g, ' ').replace(/\s+/g, ' ').trim();
}

export const UAE_SYNONYM_GROUPS: Array<{ canonical: string; aliases: string[] }> = [
  { canonical: 'Boat', aliases: ['قارب', 'قوارب', 'بوت', 'boat', 'boats', 'marine', 'بحري'] },
  { canonical: 'Garage', aliases: ['كراج', 'جراج', 'ورشه', 'ورشة', 'garage', 'workshop', 'auto repair'] },
  { canonical: 'Tyres', aliases: ['تاير', 'تواير', 'اطارات', 'إطارات', 'tyre', 'tyres', 'tire', 'tires'] },
  { canonical: 'Scrap', aliases: ['سكراب', 'خرده', 'خردة', 'scrap'] },
  { canonical: 'Aluminium', aliases: ['المنيوم', 'الالمنيوم', 'ألمنيوم', 'ألومنيوم', 'aluminium', 'aluminum'] },
  { canonical: 'Spare parts', aliases: ['قطع غيار', 'سبير بارت', 'spare parts', 'auto parts'] },
  { canonical: 'Towing', aliases: ['ونش', 'ريكفري', 'recovery', 'towing'] },
  { canonical: 'Painting', aliases: ['صبغ', 'صبغه', 'دهان', 'paint', 'painting'] },
  { canonical: 'Carpentry', aliases: ['نجار', 'نجاره', 'نجارة', 'carpenter', 'carpentry'] },
  { canonical: 'Welding', aliases: ['حداد', 'حداده', 'حدادة', 'welding', 'fabrication'] },
];

export function expandSearchTerms(query: string): string[] {
  const normalized = normalizeSearchText(query);
  const terms = new Set(normalized.split(/\s+/).filter(Boolean));
  for (const group of UAE_SYNONYM_GROUPS) {
    if (group.aliases.some((term) => normalized.includes(normalizeSearchText(term)))) {
      terms.add(normalizeSearchText(group.canonical));
      group.aliases.forEach((term) => terms.add(normalizeSearchText(term)));
    }
  }
  return [...terms];
}

export function fuzzySimilarity(a: string, b: string): number {
  const left = normalizeSearchText(a); const right = normalizeSearchText(b);
  if (!left || !right) return 0;
  if (left === right) return 1;
  if (left.includes(right) || right.includes(left)) return .86;
  const previous = Array.from({ length: right.length + 1 }, (_, i) => i);
  for (let i = 1; i <= left.length; i += 1) {
    const current = [i];
    for (let j = 1; j <= right.length; j += 1) current[j] = Math.min(current[j - 1] + 1, previous[j] + 1, previous[j - 1] + (left[i - 1] === right[j - 1] ? 0 : 1));
    previous.splice(0, previous.length, ...current);
  }
  return 1 - previous[right.length] / Math.max(left.length, right.length);
}
