/*
  Warnings:

  - You are about to drop the `participant` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "participant" DROP CONSTRAINT "participant_event_id_fkey";

-- DropForeignKey
ALTER TABLE "participant" DROP CONSTRAINT "participant_user_id_fkey";

-- DropTable
DROP TABLE "participant";

-- CreateTable
CREATE TABLE "event_participant" (
    "event_id" INTEGER NOT NULL,
    "user_id" TEXT NOT NULL,

    CONSTRAINT "event_participant_pkey" PRIMARY KEY ("event_id","user_id")
);

-- CreateTable
CREATE TABLE "challenge_participant" (
    "challenge_id" INTEGER NOT NULL,
    "user_id" TEXT NOT NULL,

    CONSTRAINT "challenge_participant_pkey" PRIMARY KEY ("challenge_id","user_id")
);

-- CreateTable
CREATE TABLE "challenge" (
    "id" SERIAL NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "description" VARCHAR(255),
    "initial_date" TIMESTAMP(3) NOT NULL,
    "final_date" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "user_id" TEXT NOT NULL,
    "category_id" INTEGER,

    CONSTRAINT "challenge_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "event_participant" ADD CONSTRAINT "event_participant_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "event"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "event_participant" ADD CONSTRAINT "event_participant_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "challenge_participant" ADD CONSTRAINT "challenge_participant_challenge_id_fkey" FOREIGN KEY ("challenge_id") REFERENCES "challenge"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "challenge_participant" ADD CONSTRAINT "challenge_participant_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "challenge" ADD CONSTRAINT "challenge_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "challenge" ADD CONSTRAINT "challenge_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "event_category"("id") ON DELETE SET NULL ON UPDATE CASCADE;
