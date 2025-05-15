-- DropForeignKey
ALTER TABLE "event" DROP CONSTRAINT "event_eventCategoryId_fkey";

-- DropForeignKey
ALTER TABLE "event" DROP CONSTRAINT "event_location_id_fkey";

-- AlterTable
ALTER TABLE "event" ALTER COLUMN "location_id" DROP NOT NULL,
ALTER COLUMN "eventCategoryId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "event" ADD CONSTRAINT "event_location_id_fkey" FOREIGN KEY ("location_id") REFERENCES "location"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "event" ADD CONSTRAINT "event_eventCategoryId_fkey" FOREIGN KEY ("eventCategoryId") REFERENCES "event_category"("id") ON DELETE SET NULL ON UPDATE CASCADE;
