/**
 * Global, informative tour price per person, stored as an integer number of
 * cents under the generic AppSetting table. The client reads it to display the
 * price; the admin app will update it. There is no payment flow in this
 * iteration — the value is display-only.
 */
export const TOUR_PRICE_CENTS_KEY = 'tour.price_cents';

export const TOUR_PRICE_CENTS_DEFAULT = 5000000;

export function parseIntSetting(
  value: string | null,
  fallback: number,
): number {
  if (value === null) {
    return fallback;
  }
  const parsed = Number.parseInt(value, 10);
  return Number.isNaN(parsed) ? fallback : parsed;
}

export function serializeIntSetting(value: number): string {
  return String(value);
}
