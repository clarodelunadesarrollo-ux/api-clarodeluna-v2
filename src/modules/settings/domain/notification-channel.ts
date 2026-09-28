/**
 * Feature flag that controls how the OTP code is delivered to the user.
 * When enabled, the app shows a local OS notification plus an in-app modal.
 * When disabled, the app tells the user to check the code sent to their email.
 */
export const OTP_LOCAL_NOTIFICATION_ENABLED_KEY =
  'otp.local_notification_enabled';

export const OTP_LOCAL_NOTIFICATION_ENABLED_DEFAULT = true;

export function parseBooleanSetting(
  value: string | null,
  fallback: boolean,
): boolean {
  if (value === null) {
    return fallback;
  }
  return value === 'true';
}

export function serializeBooleanSetting(value: boolean): string {
  return value ? 'true' : 'false';
}
