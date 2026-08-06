/*
  Warnings:

  - You are about to drop the column `scheduledAt` on the `bookings` table. All the data in the column will be lost.
  - Added the required column `bookingDate` to the `bookings` table without a default value. This is not possible if the table is not empty.
  - Added the required column `timeSlot` to the `bookings` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "bookings" DROP COLUMN "scheduledAt",
ADD COLUMN     "bookingDate" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "timeSlot" TEXT NOT NULL;
