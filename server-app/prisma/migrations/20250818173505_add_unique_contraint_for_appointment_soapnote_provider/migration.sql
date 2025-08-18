/*
  Warnings:

  - A unique constraint covering the columns `[appointment_id,created_by_id]` on the table `soap_notes` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "soap_notes_appointment_id_created_by_id_key" ON "soap_notes"("appointment_id", "created_by_id");
