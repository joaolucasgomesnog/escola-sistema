/*
  Warnings:

  - You are about to drop the column `courseId` on the `Student` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Student" DROP CONSTRAINT "Student_courseId_fkey";

-- AlterTable
ALTER TABLE "Student" DROP COLUMN "courseId";
