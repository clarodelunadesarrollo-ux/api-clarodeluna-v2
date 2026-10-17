/**
 * Editable, admin-managed interface texts for the tour map screen. Stored as a
 * single JSON string under the generic AppSetting table (key `tour.map_texts`).
 * The client reads them to render the UI; the admin app updates them. Parsing
 * is tolerant: null, invalid JSON or missing/invalid fields fall back to the
 * Spanish defaults on a per-field basis. Mirrors the tour-pricing style.
 */
export const TOUR_MAP_TEXTS_KEY = 'tour.map_texts';

// The literal token that MUST appear in stepLabel; the client replaces it with
// the stop number (e.g. "Parada 1").
export const STEP_LABEL_ORDER_TOKEN = '{order}';

export interface TourMapTexts {
  title: string;
  subtitle: string;
  retry: string;
  backTooltip: string;
  refreshTooltip: string;
  close: string;
  emptyTitle: string;
  emptyMessage: string;
  stepLabel: string;
  failureNetwork: string;
  failureSession: string;
  failureServer: string;
}

export const TOUR_MAP_TEXTS_DEFAULT: TourMapTexts = {
  title: 'Tu recorrido',
  subtitle: 'Tocá un punto del mapa para ver el detalle.',
  retry: 'Reintentar',
  backTooltip: 'Volver al inicio',
  refreshTooltip: 'Actualizar recorrido',
  close: 'Cerrar',
  emptyTitle: 'Todavía no hay paradas cargadas',
  emptyMessage: 'Cuando el equipo cargue el recorrido, lo vas a ver acá.',
  stepLabel: 'Parada {order}',
  failureNetwork: 'Sin conexión. Revisá tu internet y reintentá.',
  failureSession: 'Tu sesión expiró. Ingresá de nuevo.',
  failureServer: 'No pudimos cargar el recorrido. Reintentá.',
};

export const TOUR_MAP_TEXT_FIELDS = [
  'title',
  'subtitle',
  'retry',
  'backTooltip',
  'refreshTooltip',
  'close',
  'emptyTitle',
  'emptyMessage',
  'stepLabel',
  'failureNetwork',
  'failureSession',
  'failureServer',
] as const;

export function parseTourMapTexts(value: string | null): TourMapTexts {
  const result: TourMapTexts = { ...TOUR_MAP_TEXTS_DEFAULT };
  if (value === null) {
    return result;
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(value);
  } catch {
    return result;
  }
  if (parsed === null || typeof parsed !== 'object') {
    return result;
  }

  const record = parsed as Record<string, unknown>;
  for (const field of TOUR_MAP_TEXT_FIELDS) {
    const candidate = record[field];
    if (typeof candidate === 'string' && candidate.length > 0) {
      result[field] = candidate;
    }
  }
  return result;
}

export function serializeTourMapTexts(texts: TourMapTexts): string {
  return JSON.stringify(texts);
}

export function hasOrderToken(stepLabel: string): boolean {
  return stepLabel.includes(STEP_LABEL_ORDER_TOKEN);
}
