export const HUERTA_ACCESS = Symbol('HUERTA_ACCESS');

export interface HuertaAccessPort {
  // True when the user has at least one CHECKED_IN reservation for today (AD-1).
  hasCheckedInToday(userId: string): Promise<boolean>;
}
