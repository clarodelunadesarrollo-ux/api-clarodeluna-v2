export enum BlackoutScope {
  RESTAURANT = 'RESTAURANT',
  TOUR = 'TOUR',
  BOTH = 'BOTH',
}

import { ReservationType } from './reservation-type.enum';

/**
 * Whether a blackout with the given scope blocks reservations of `type`.
 * BOTH blocks everything; otherwise the scope must match the reservation type.
 */
export function blackoutAffectsType(
  scope: BlackoutScope,
  type: ReservationType,
): boolean {
  return scope === BlackoutScope.BOTH || (scope as string) === (type as string);
}
