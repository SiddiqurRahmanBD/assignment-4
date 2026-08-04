/*
  Warnings:

  - You are about to drop the column `bio` on the `technician_profiles` table. All the data in the column will be lost.
  - You are about to drop the column `skill` on the `technician_profiles` table. All the data in the column will be lost.
  - Added the required column `location` to the `technician_profiles` table without a default value. This is not possible if the table is not empty.
  - Added the required column `skills` to the `technician_profiles` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "technician_profiles" DROP COLUMN "bio",
DROP COLUMN "skill",
ADD COLUMN     "location" TEXT NOT NULL,
ADD COLUMN     "skills" TEXT NOT NULL,
ALTER COLUMN "experience" DROP DEFAULT,
ALTER COLUMN "experience" SET DATA TYPE TEXT;
