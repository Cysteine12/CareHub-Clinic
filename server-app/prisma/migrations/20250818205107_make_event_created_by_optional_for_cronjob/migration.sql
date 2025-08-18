-- DropForeignKey
ALTER TABLE "events" DROP CONSTRAINT "events_created_by_id_fkey";

-- AlterTable
ALTER TABLE "events" ALTER COLUMN "created_by_id" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "events" ADD CONSTRAINT "events_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "providers"("id") ON DELETE SET NULL ON UPDATE CASCADE;
