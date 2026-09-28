export const RESERVATION_POLICY_CONFIG = Symbol('RESERVATION_POLICY_CONFIG');

export interface ReservationPolicyConfig {
  maxActiveTours: number;
  dateWindowDays: number;
  minPartySize: number;
  maxPartySize: number;
}
