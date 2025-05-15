/*
  Warnings:

  - You are about to drop the column `eventCategoryId` on the `event` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "event" DROP CONSTRAINT "event_eventCategoryId_fkey";

-- AlterTable
ALTER TABLE "event" DROP COLUMN "eventCategoryId",
ADD COLUMN     "category_id" INTEGER;

-- AddForeignKey
ALTER TABLE "event" ADD CONSTRAINT "event_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "event_category"("id") ON DELETE SET NULL ON UPDATE CASCADE;
