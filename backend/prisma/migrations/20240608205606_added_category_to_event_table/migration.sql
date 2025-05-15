/*
  Warnings:

  - Added the required column `eventCategoryId` to the `event` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "event" ADD COLUMN     "eventCategoryId" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "event" ADD CONSTRAINT "event_eventCategoryId_fkey" FOREIGN KEY ("eventCategoryId") REFERENCES "event_category"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
