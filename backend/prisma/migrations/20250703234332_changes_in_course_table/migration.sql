-- AlterTable
ALTER TABLE "Course" ADD COLUMN     "MonthlyFeeValue" DOUBLE PRECISION,
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "registrationFeeValue" DOUBLE PRECISION;
