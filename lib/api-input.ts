export function readString(value: unknown, max = 500): string {
  if (typeof value !== 'string' || !value.trim()) throw new Error('INVALID_INPUT');
  return value.trim().slice(0, max);
}

export function readOptionalString(value: unknown, max = 500): string | null {
  if (value === undefined || value === null || value === '') return null;
  return readString(value, max);
}
