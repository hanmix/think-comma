import { randomUUID } from 'crypto';

const contexts = new Map<string, string>();

export function createContextId(anonId: string): string {
  const id = randomUUID();
  contexts.set(id, anonId);
  return id;
}

export function hasContextId(id: string, anonId: string): boolean {
  console.log('contexts: ', contexts);
  return contexts.get(id) === anonId;
}
