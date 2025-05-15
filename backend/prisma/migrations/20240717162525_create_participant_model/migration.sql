-- CreateTable
CREATE TABLE "participant" (
    "event_id" INTEGER NOT NULL,
    "user_id" TEXT NOT NULL,

    CONSTRAINT "participant_pkey" PRIMARY KEY ("event_id","user_id")
);

-- AddForeignKey
ALTER TABLE "participant" ADD CONSTRAINT "participant_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "event"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "participant" ADD CONSTRAINT "participant_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
