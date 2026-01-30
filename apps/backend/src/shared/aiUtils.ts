export function isTrivialChoiceLabel(value?: string): boolean {
  if (!value) return true;
  const trimmed = String(value).trim();
  if (!trimmed) return true;
  if (trimmed.length <= 2) return /^[AB]$/i.test(trimmed);
  const letters = trimmed.replace(/[^A-Za-z]/g, '').toUpperCase();
  return letters === 'A' || letters === 'B';
}

export function normalizeConfidence(confidence: number): number {
  const normalized = confidence > 1 ? confidence / 100 : confidence;
  return Number(normalized.toFixed(2));
}
