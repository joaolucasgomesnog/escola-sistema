-- AlterTable
ALTER TABLE "user" ADD COLUMN     "count_followers" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "count_following" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "count_posts" INTEGER NOT NULL DEFAULT 0;
