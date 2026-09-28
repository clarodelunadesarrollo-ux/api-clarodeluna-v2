-- CreateEnum
CREATE TYPE "MenuType" AS ENUM ('TOUR', 'RESTAURANT');

-- CreateTable
CREATE TABLE "MenuSection" (
    "id" TEXT NOT NULL,
    "menuType" "MenuType" NOT NULL,
    "title" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MenuSection_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MenuDish" (
    "id" TEXT NOT NULL,
    "sectionId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "priceCents" INTEGER,
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "order" INTEGER NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MenuDish_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "MenuSection_menuType_active_order_idx" ON "MenuSection"("menuType", "active", "order");

-- CreateIndex
CREATE INDEX "MenuDish_sectionId_active_order_idx" ON "MenuDish"("sectionId", "active", "order");

-- AddForeignKey
ALTER TABLE "MenuDish" ADD CONSTRAINT "MenuDish_sectionId_fkey" FOREIGN KEY ("sectionId") REFERENCES "MenuSection"("id") ON DELETE CASCADE ON UPDATE CASCADE;
