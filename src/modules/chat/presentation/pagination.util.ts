export const DEFAULT_MESSAGES_LIMIT = 50;
export const MAX_MESSAGES_LIMIT = 100;

// Parses the optional `limit` query param into a safe, bounded page size.
export function parseMessagesLimit(raw?: string): number {
  const parsed = Number(raw);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return DEFAULT_MESSAGES_LIMIT;
  }
  return Math.min(Math.floor(parsed), MAX_MESSAGES_LIMIT);
}
