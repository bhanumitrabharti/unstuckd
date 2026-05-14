-- CreateEnum
CREATE TYPE "Tier" AS ENUM ('COMMUNITY', 'VERIFIED', 'PREMIUM');

-- CreateEnum
CREATE TYPE "SessionStatus" AS ENUM ('CREATED', 'MATCHED', 'STARTED', 'COMPLETED', 'DISPUTED', 'RESOLVED');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Expert" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "expertise" TEXT[],
    "tier" "Tier" NOT NULL DEFAULT 'COMMUNITY',
    "rating" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "hourlyRate" INTEGER NOT NULL,

    CONSTRAINT "Expert_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL,
    "status" "SessionStatus" NOT NULL DEFAULT 'CREATED',
    "problemDesc" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "clientId" TEXT NOT NULL,
    "expertId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_expertId_fkey" FOREIGN KEY ("expertId") REFERENCES "Expert"("id") ON DELETE SET NULL ON UPDATE CASCADE;
