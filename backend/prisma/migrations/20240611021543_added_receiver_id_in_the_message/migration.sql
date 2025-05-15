/*
  Warnings:

  - Added the required column `receiver_id` to the `Message` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Message" ADD COLUMN     "receiver_id" INTEGER NOT NULL;
