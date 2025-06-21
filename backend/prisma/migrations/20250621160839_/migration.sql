/*
  Warnings:

  - Changed the type of `paymentType` on the `Payment` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Added the required column `courseId` to the `Student` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "PaymentType" AS ENUM ('DINHEIRO', 'BOLETO', 'CREDITO', 'DEBITO', 'DEPOSITO', 'PIX');

-- AlterTable
ALTER TABLE "Payment" DROP COLUMN "paymentType",
ADD COLUMN     "paymentType" "PaymentType" NOT NULL;

-- AlterTable
ALTER TABLE "Student" ADD COLUMN     "courseId" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "Student" ADD CONSTRAINT "Student_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
