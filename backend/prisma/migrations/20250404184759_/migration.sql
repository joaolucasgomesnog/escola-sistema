/*
  Warnings:

  - Added the required column `selected_category` to the `registration` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "registration" ADD COLUMN     "selected_category" TEXT NOT NULL;
