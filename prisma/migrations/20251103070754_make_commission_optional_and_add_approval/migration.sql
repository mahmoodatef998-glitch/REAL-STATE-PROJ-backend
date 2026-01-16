-- AlterTable
ALTER TABLE "deals" ADD COLUMN     "commission_approved" BOOLEAN NOT NULL DEFAULT false,
ALTER COLUMN "commission_rate" DROP NOT NULL,
ALTER COLUMN "broker_share" DROP NOT NULL,
ALTER COLUMN "company_share" DROP NOT NULL,
ALTER COLUMN "commission_value" DROP NOT NULL;
