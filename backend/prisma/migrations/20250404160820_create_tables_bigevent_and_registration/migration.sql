-- AlterTable
ALTER TABLE "location" ADD COLUMN     "city" TEXT,
ADD COLUMN     "state" TEXT;

-- CreateTable
CREATE TABLE "big_event" (
    "id" SERIAL NOT NULL,
    "user_id" TEXT NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "description" VARCHAR(800),
    "event_date" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "location_id" INTEGER,
    "category_id" INTEGER,
    "image_url" VARCHAR(255) NOT NULL,
    "organizer" TEXT NOT NULL,
    "categories" TEXT[],
    "additional_items" JSONB,
    "payment_methods" TEXT[],
    "registration_price" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "big_event_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "registration" (
    "id" SERIAL NOT NULL,
    "user_id" TEXT NOT NULL,
    "cpf" TEXT NOT NULL,
    "birth_date" TIMESTAMP(3) NOT NULL,
    "team" TEXT,
    "name_on_shirt" TEXT,
    "big_event_id" INTEGER,
    "payment_status" TEXT NOT NULL,
    "additional" JSONB,
    "subtotal" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "registration_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "big_event" ADD CONSTRAINT "big_event_location_id_fkey" FOREIGN KEY ("location_id") REFERENCES "location"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "big_event" ADD CONSTRAINT "big_event_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "event_category"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "big_event" ADD CONSTRAINT "big_event_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "registration" ADD CONSTRAINT "registration_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "registration" ADD CONSTRAINT "registration_big_event_id_fkey" FOREIGN KEY ("big_event_id") REFERENCES "big_event"("id") ON DELETE SET NULL ON UPDATE CASCADE;
