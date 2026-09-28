import { MenuType } from '../../../domain/enums/menu-type.enum';

export const RESERVATION_CONTEXT = Symbol('RESERVATION_CONTEXT');

export interface ReservationContextPort {
  // Resolves the menu type the user is entitled to right now, based on their
  // most recent checked-in reservation for today. Returns null when there is
  // no active context (no check-in today).
  resolveActiveMenuType(userId: string): Promise<MenuType | null>;
}
