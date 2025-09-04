/*
  Warnings:

  - The values [ATTENDING,ATTENDED] on the enum `AppointmentStatus` will be removed. If these variants are still used in the database, this will fail.

*/
-- CreateEnum
CREATE TYPE "AppointmentProviderStatus" AS ENUM ('ASSIGNED', 'ATTENDING', 'ATTENDED');

-- AlterEnum
BEGIN;
CREATE TYPE "AppointmentStatus_new" AS ENUM ('SUBMITTED', 'SCHEDULED', 'CHECKED IN', 'CANCELLED', 'RESCHEDULED', 'NO SHOW', 'COMPLETED', 'CONFIRMED');
ALTER TABLE "appointments" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "appointments" ALTER COLUMN "status" TYPE "AppointmentStatus_new" USING ("status"::text::"AppointmentStatus_new");
ALTER TYPE "AppointmentStatus" RENAME TO "AppointmentStatus_old";
ALTER TYPE "AppointmentStatus_new" RENAME TO "AppointmentStatus";
DROP TYPE "AppointmentStatus_old";
ALTER TABLE "appointments" ALTER COLUMN "status" SET DEFAULT 'SUBMITTED';
COMMIT;

-- AlterEnum
ALTER TYPE "EventType" ADD VALUE 'PROVIDER STATUS CHANGED';

-- AlterTable
ALTER TABLE "appointment_providers" ADD COLUMN     "status" "AppointmentProviderStatus" NOT NULL DEFAULT 'ASSIGNED';
