export function extractJson(raw: string): string {
  const text = raw.trim();
  const fence =
    text.match(/```json[\s\S]*?\n([\s\S]*?)```/i) ||
    text.match(/```\s*\n([\s\S]*?)```/i);
  const body = fence ? fence[1] : text;

  const firstObj = body.indexOf('{');
  const firstArr = body.indexOf('[');
  const start =
    [firstObj, firstArr].filter(i => i >= 0).sort((a, b) => a - b)[0] ?? -1;
  if (start < 0) throw new Error('No JSON start token found');

  const candidate = body.slice(start).trim();

  try {
    JSON.parse(candidate);
    return candidate;
  } catch {}

  const endObj = candidate.lastIndexOf('}');
  const endArr = candidate.lastIndexOf(']');
  const end = Math.max(endObj, endArr);
  if (end >= 0) {
    const sliced = candidate.slice(0, end + 1);
    JSON.parse(sliced);
    return sliced;
  }

  throw new Error('Unable to extract valid JSON');
}
