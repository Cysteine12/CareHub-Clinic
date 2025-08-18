/*
  Warnings:

  - You are about to drop the column `follow_up_id` on the `appointments` table. All the data in the column will be lost.
  - You are about to drop the column `vitals_id` on the `appointments` table. All the data in the column will be lost.
  - You are about to drop the column `vitals_id` on the `events` table. All the data in the column will be lost.
  - You are about to drop the `CalendarToken` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `InsuranceProvider` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `appointmentproviders` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `soapnotes` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[followed_up_appointment_id]` on the table `appointments` will be added. If there are existing duplicate values, this will fail.
  - Made the column `updated_at` on table `events` required. This step will fail if there are existing NULL values in that column.
  - Made the column `appointment_id` on table `events` required. This step will fail if there are existing NULL values in that column.
  - Made the column `updated_at` on table `vitals` required. This step will fail if there are existing NULL values in that column.
  - Made the column `created_by_id` on table `vitals` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterEnum
ALTER TYPE "AppointmentStatus" ADD VALUE 'ATTENDED';

-- AlterEnum
ALTER TYPE "EventType" ADD VALUE 'VITALS UPDATED';

-- DropForeignKey
ALTER TABLE "CalendarToken" DROP CONSTRAINT "CalendarToken_patient_id_fkey";

-- DropForeignKey
ALTER TABLE "appointmentproviders" DROP CONSTRAINT "appointmentproviders_appointment_id_fkey";

-- DropForeignKey
ALTER TABLE "appointmentproviders" DROP CONSTRAINT "appointmentproviders_provider_id_fkey";

-- DropForeignKey
ALTER TABLE "appointments" DROP CONSTRAINT "appointments_follow_up_id_fkey";

-- DropForeignKey
ALTER TABLE "events" DROP CONSTRAINT "events_appointment_id_fkey";

-- DropForeignKey
ALTER TABLE "events" DROP CONSTRAINT "events_soap_note_id_fkey";

-- DropForeignKey
ALTER TABLE "events" DROP CONSTRAINT "events_vitals_id_fkey";

-- DropForeignKey
ALTER TABLE "patients" DROP CONSTRAINT "patients_insurance_provider_id_fkey";

-- DropForeignKey
ALTER TABLE "soapnotes" DROP CONSTRAINT "soapnotes_appointment_id_fkey";

-- DropForeignKey
ALTER TABLE "soapnotes" DROP CONSTRAINT "soapnotes_created_by_id_fkey";

-- DropForeignKey
ALTER TABLE "vitals" DROP CONSTRAINT "vitals_created_by_id_fkey";

-- DropIndex
DROP INDEX "appointments_vitals_id_key";

-- AlterTable
ALTER TABLE "appointments" DROP COLUMN "follow_up_id",
DROP COLUMN "vitals_id",
ADD COLUMN     "followed_up_appointment_id" TEXT;

-- AlterTable
ALTER TABLE "events" DROP COLUMN "vitals_id",
ADD COLUMN     "vital_id" TEXT,
ALTER COLUMN "updated_at" SET NOT NULL,
ALTER COLUMN "appointment_id" SET NOT NULL;

-- AlterTable
ALTER TABLE "vitals" ALTER COLUMN "updated_at" SET NOT NULL,
ALTER COLUMN "created_by_id" SET NOT NULL;

-- DropTable
DROP TABLE "CalendarToken";

-- DropTable
DROP TABLE "InsuranceProvider";

-- DropTable
DROP TABLE "appointmentproviders";

-- DropTable
DROP TABLE "soapnotes";

-- CreateTable
CREATE TABLE "appointment_providers" (
    "id" TEXT NOT NULL,
    "appointment_id" TEXT NOT NULL,
    "provider_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "appointment_providers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "soap_notes" (
    "id" TEXT NOT NULL,
    "appointment_id" TEXT NOT NULL,
    "subjective" JSONB,
    "objective" JSONB,
    "assessment" JSONB,
    "plan" JSONB,
    "created_by_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "soap_notes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "insurance_providers" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "insurance_providers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "calendar_tokens" (
    "id" TEXT NOT NULL,
    "tokens" JSONB NOT NULL,
    "patient_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "calendar_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "appointment_providers_appointment_id_provider_id_key" ON "appointment_providers"("appointment_id", "provider_id");

-- CreateIndex
CREATE UNIQUE INDEX "calendar_tokens_patient_id_key" ON "calendar_tokens"("patient_id");

-- CreateIndex
CREATE UNIQUE INDEX "appointments_followed_up_appointment_id_key" ON "appointments"("followed_up_appointment_id");

-- AddForeignKey
ALTER TABLE "patients" ADD CONSTRAINT "patients_insurance_provider_id_fkey" FOREIGN KEY ("insurance_provider_id") REFERENCES "insurance_providers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_followed_up_appointment_id_fkey" FOREIGN KEY ("followed_up_appointment_id") REFERENCES "appointments"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "appointment_providers" ADD CONSTRAINT "appointment_providers_provider_id_fkey" FOREIGN KEY ("provider_id") REFERENCES "providers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "appointment_providers" ADD CONSTRAINT "appointment_providers_appointment_id_fkey" FOREIGN KEY ("appointment_id") REFERENCES "appointments"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "soap_notes" ADD CONSTRAINT "soap_notes_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "providers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "soap_notes" ADD CONSTRAINT "soap_notes_appointment_id_fkey" FOREIGN KEY ("appointment_id") REFERENCES "appointments"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vitals" ADD CONSTRAINT "vitals_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "providers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "events" ADD CONSTRAINT "events_appointment_id_fkey" FOREIGN KEY ("appointment_id") REFERENCES "appointments"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "events" ADD CONSTRAINT "events_soap_note_id_fkey" FOREIGN KEY ("soap_note_id") REFERENCES "soap_notes"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "events" ADD CONSTRAINT "events_vital_id_fkey" FOREIGN KEY ("vital_id") REFERENCES "vitals"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "calendar_tokens" ADD CONSTRAINT "calendar_tokens_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "patients"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
