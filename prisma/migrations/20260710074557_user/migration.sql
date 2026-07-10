-- CreateEnum
CREATE TYPE "Role" AS ENUM ('TENANT', 'LANDLORD', 'ADMIN');

-- CreateEnum
CREATE TYPE "UserStatus" AS ENUM ('ACTIVE', 'BANNED');

-- CreateTable
CREATE TABLE "Users" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "phone" TEXT,
    "avatarUrl" TEXT,
    "role" "Role" NOT NULL DEFAULT 'TENANT',
    "status" "UserStatus" NOT NULL DEFAULT 'ACTIVE',

    CONSTRAINT "Users_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Users_email_key" ON "Users"("email");
