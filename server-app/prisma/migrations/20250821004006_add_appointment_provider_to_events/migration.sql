-- AlterTable
ALTER TABLE "events" ADD COLUMN     "appointment_provider_id" TEXT;

-- AddForeignKey
ALTER TABLE "events" ADD CONSTRAINT "events_appointment_provider_id_fkey" FOREIGN KEY ("appointment_provider_id") REFERENCES "appointment_providers"("id") ON DELETE SET NULL ON UPDATE CASCADE;
