/*
  Warnings:

  - Added the required column `commission_value` to the `deals` table without a default value. This is not possible if the table is not empty.
  - Added the required column `deal_value` to the `deals` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "deals" ADD COLUMN     "client_id" INTEGER,
ADD COLUMN     "commission_value" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "date_closed" TIMESTAMP(3),
ADD COLUMN     "deal_type" TEXT NOT NULL DEFAULT 'sale',
ADD COLUMN     "deal_value" DOUBLE PRECISION NOT NULL,
ALTER COLUMN "sale_price" DROP NOT NULL,
ALTER COLUMN "status" SET DEFAULT 'open';

-- AlterTable
ALTER TABLE "leads" ADD COLUMN     "company_id" INTEGER;

-- AlterTable
ALTER TABLE "properties" ADD COLUMN     "company_id" INTEGER;

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "company_id" INTEGER;

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "properties" ADD CONSTRAINT "properties_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "leads" ADD CONSTRAINT "leads_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "deals" ADD CONSTRAINT "deals_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
