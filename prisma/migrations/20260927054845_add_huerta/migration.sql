-- CreateEnum
CREATE TYPE "HuertaItemType" AS ENUM ('IMAGE', 'VIDEO');

-- CreateTable
CREATE TABLE "HuertaItem" (
    "id" TEXT NOT NULL,
    "type" "HuertaItemType" NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "mediaUrl" TEXT NOT NULL,
    "posterUrl" TEXT,
    "order" INTEGER NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "HuertaItem_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "HuertaItem_active_order_idx" ON "HuertaItem"("active", "order");
