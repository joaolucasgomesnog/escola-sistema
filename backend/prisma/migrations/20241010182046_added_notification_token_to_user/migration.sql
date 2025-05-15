/*
  Warnings:

  - A unique constraint covering the columns `[notificationToken]` on the table `user` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "user" ADD COLUMN     "notificationToken" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "user_notificationToken_key" ON "user"("notificationToken");
