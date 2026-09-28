export const CHECKIN_CODE_GENERATOR = Symbol('CHECKIN_CODE_GENERATOR');

/**
 * Outbound port that derives the numeric check-in code for a given rotation
 * counter. Deterministic: the same counter always yields the same code.
 */
export interface CheckinCodeGeneratorPort {
  derive(counter: number): string;
}
