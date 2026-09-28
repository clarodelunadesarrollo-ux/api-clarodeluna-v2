-- CreateEnum
CREATE TYPE "BlackoutScope" AS ENUM ('RESTAURANT', 'TOUR', 'BOTH');

-- DropTable
DROP TABLE "RestaurantSchedule";

-- DropTable
DROP TABLE "TourSlot";

-- CreateTable
CREATE TABLE "ReservationSchedule" (
    "id" TEXT NOT NULL,
    "type" "ReservationType" NOT NULL,
    "openTime" TEXT NOT NULL,
    "closeTime" TEXT NOT NULL,
    "intervalMinutes" INTEGER NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ReservationSchedule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReservationBlackout" (
    "id" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "scope" "BlackoutScope" NOT NULL,
    "reason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ReservationBlackout_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ReservationSchedule_type_key" ON "ReservationSchedule"("type");

-- CreateIndex
CREATE UNIQUE INDEX "ReservationBlackout_date_key" ON "ReservationBlackout"("date");
