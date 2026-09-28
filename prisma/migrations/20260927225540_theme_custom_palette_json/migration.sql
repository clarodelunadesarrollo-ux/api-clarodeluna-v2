/*
  Warnings:

  - You are about to drop the column `customBackground` on the `ThemeConfiguration` table. All the data in the column will be lost.
  - You are about to drop the column `customPrimary` on the `ThemeConfiguration` table. All the data in the column will be lost.
  - You are about to drop the column `customSecondary` on the `ThemeConfiguration` table. All the data in the column will be lost.
  - You are about to drop the column `customSurface` on the `ThemeConfiguration` table. All the data in the column will be lost.
  - You are about to drop the column `customTertiary` on the `ThemeConfiguration` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "ThemeConfiguration" DROP COLUMN "customBackground",
DROP COLUMN "customPrimary",
DROP COLUMN "customSecondary",
DROP COLUMN "customSurface",
DROP COLUMN "customTertiary",
ADD COLUMN     "customPalette" JSONB;
