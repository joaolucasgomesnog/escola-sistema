/*
  Warnings:

  - You are about to drop the column `value` on the `Fee` table. All the data in the column will be lost.
  - Added the required column `price` to the `Fee` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Fee" DROP COLUMN "value",
ADD COLUMN     "price" DOUBLE PRECISION NOT NULL;
