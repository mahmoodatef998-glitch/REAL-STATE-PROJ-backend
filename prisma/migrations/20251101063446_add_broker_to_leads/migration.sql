/*
  Warnings:

  - You are about to drop the column `name` on the `leads` table. All the data in the column will be lost.
  - You are about to drop the column `phone` on the `leads` table. All the data in the column will be lost.
  - Added the required column `lead_name` to the `leads` table without a default value. This is not possible if the table is not empty.
  - Added the required column `lead_phone` to the `leads` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "leads" DROP COLUMN "name",
DROP COLUMN "phone",
ADD COLUMN     "broker_id" INTEGER,
ADD COLUMN     "lead_name" TEXT NOT NULL,
ADD COLUMN     "lead_phone" TEXT NOT NULL,
ALTER COLUMN "email" SET DEFAULT '';

-- AddForeignKey
ALTER TABLE "leads" ADD CONSTRAINT "leads_broker_id_fkey" FOREIGN KEY ("broker_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
