/*
  Warnings:

  - The `categories` column on the `big_event` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "big_event" DROP COLUMN "categories",
ADD COLUMN     "categories" JSONB;
