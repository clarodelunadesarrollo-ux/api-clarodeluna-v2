-- CreateTable
CREATE TABLE "ThemePreset" (
    "key" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "suggestedUse" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "palette" JSONB NOT NULL,
    "semantic" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ThemePreset_pkey" PRIMARY KEY ("key")
);

-- CreateIndex
CREATE INDEX "ThemePreset_sortOrder_idx" ON "ThemePreset"("sortOrder");
