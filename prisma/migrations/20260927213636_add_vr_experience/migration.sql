-- CreateTable
CREATE TABLE "VrExperience" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "videoUrl" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VrExperience_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "VrExperience_updatedAt_idx" ON "VrExperience"("updatedAt");
