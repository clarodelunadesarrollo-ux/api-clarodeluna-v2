import { SetMetadata } from '@nestjs/common';

export const IS_PUBLIC_KEY = 'isPublic';

/**
 * Marks a route/controller as publicly accessible.
 * Intended for a future deny-by-default global auth guard; the OTP endpoints
 * are the explicit public entry points to authentication.
 */
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
