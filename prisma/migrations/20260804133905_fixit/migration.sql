/*
  Warnings:

  - The `skills` column on the `technician_profiles` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "technician_profiles" DROP COLUMN "skills",
ADD COLUMN     "skills" TEXT[];
