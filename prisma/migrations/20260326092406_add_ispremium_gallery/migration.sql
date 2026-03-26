/*
  Warnings:

  - You are about to drop the column `isPrenium` on the `Gallery` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Gallery" DROP COLUMN "isPrenium",
ADD COLUMN     "isPremium" BOOLEAN NOT NULL DEFAULT false;
