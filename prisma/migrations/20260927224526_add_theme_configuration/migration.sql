-- CreateEnum
CREATE TYPE "ThemeMode" AS ENUM ('LIGHT', 'DARK', 'SYSTEM');

-- CreateEnum
CREATE TYPE "PaletteSource" AS ENUM ('PRESET', 'CUSTOM');

-- CreateTable
CREATE TABLE "ThemeConfiguration" (
    "id" TEXT NOT NULL DEFAULT 'singleton',
    "mode" "ThemeMode" NOT NULL DEFAULT 'SYSTEM',
    "titleFontFamily" TEXT NOT NULL,
    "titleFontWeight" INTEGER NOT NULL,
    "subtitleFontFamily" TEXT NOT NULL,
    "subtitleFontWeight" INTEGER NOT NULL,
    "bodyFontFamily" TEXT NOT NULL,
    "bodyFontWeight" INTEGER NOT NULL,
    "paletteSource" "PaletteSource" NOT NULL DEFAULT 'PRESET',
    "presetKey" TEXT,
    "customPrimary" TEXT,
    "customSecondary" TEXT,
    "customTertiary" TEXT,
    "customBackground" TEXT,
    "customSurface" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ThemeConfiguration_pkey" PRIMARY KEY ("id")
);
