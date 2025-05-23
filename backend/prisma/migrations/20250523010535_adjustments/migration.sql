/*
  Warnings:

  - A unique constraint covering the columns `[studentId,classId,date]` on the table `Attendence` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `code` to the `Class` table without a default value. This is not possible if the table is not empty.
  - Added the required column `name` to the `Class` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Attendence" ALTER COLUMN "date" SET DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "Class" ADD COLUMN     "code" TEXT NOT NULL,
ADD COLUMN     "name" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Attendence_studentId_classId_date_key" ON "Attendence"("studentId", "classId", "date");
