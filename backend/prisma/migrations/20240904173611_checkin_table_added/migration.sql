-- CreateTable
CREATE TABLE "checkin" (
    "id" SERIAL NOT NULL,
    "description" VARCHAR(255),
    "pic_url" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "user_id" TEXT NOT NULL,
    "challengeId" INTEGER NOT NULL,

    CONSTRAINT "checkin_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "checkin" ADD CONSTRAINT "checkin_challengeId_fkey" FOREIGN KEY ("challengeId") REFERENCES "challenge"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "checkin" ADD CONSTRAINT "checkin_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
