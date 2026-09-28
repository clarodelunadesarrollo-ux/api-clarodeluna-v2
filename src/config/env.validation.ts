/**
 * Lightweight, dependency-free environment validation.
 * Kept as pure TypeScript to avoid pulling extra packages (zod/joi) into the minimal dependency set.
 */
export function validateEnv(
  config: Record<string, unknown>,
): Record<string, unknown> {
  const required = [
    'DATABASE_URL',
    'JWT_ACCESS_SECRET',
    'JWT_REFRESH_SECRET',
    'CHECKIN_VENUE_SECRET',
    'ADMIN_PANEL_KEY',
  ];

  const missing = required.filter((key) => {
    const value = config[key];
    return value === undefined || value === null || String(value).trim().length === 0;
  });

  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }

  for (const secret of [
    'JWT_ACCESS_SECRET',
    'JWT_REFRESH_SECRET',
    'CHECKIN_VENUE_SECRET',
    'ADMIN_PANEL_KEY',
  ]) {
    if (String(config[secret]).length < 32) {
      throw new Error(`Environment variable ${secret} must be at least 32 characters long`);
    }
  }

  return config;
}
