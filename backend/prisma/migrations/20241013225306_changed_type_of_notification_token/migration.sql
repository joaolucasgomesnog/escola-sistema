/*
  Warnings:

  - You are about to drop the column `notificationToken` on the `user` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "user_notificationToken_key";

-- AlterTable
ALTER TABLE "user" DROP COLUMN "notificationToken",
ADD COLUMN     "notificationTokens" TEXT[];
