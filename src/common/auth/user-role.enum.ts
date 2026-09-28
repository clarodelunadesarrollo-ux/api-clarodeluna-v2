/**
 * Application-level user roles. Mirrors the Prisma `UserRole` enum. Kept in the
 * common auth layer so guards/decorators can reference it without depending on
 * any feature module.
 */
export enum UserRole {
  CLIENT = 'CLIENT',
  ADMIN = 'ADMIN',
}
