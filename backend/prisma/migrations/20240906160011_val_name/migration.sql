/*
  Warnings:

  - You are about to drop the column `challengeId` on the `checkin` table. All the data in the column will be lost.
  - Added the required column `challenge_id` to the `checkin` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "checkin" DROP CONSTRAINT "checkin_challengeId_fkey";

-- AlterTable
ALTER TABLE "checkin" DROP COLUMN "challengeId",
ADD COLUMN     "challenge_id" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "checkin" ADD CONSTRAINT "checkin_challenge_id_fkey" FOREIGN KEY ("challenge_id") REFERENCES "challenge"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
