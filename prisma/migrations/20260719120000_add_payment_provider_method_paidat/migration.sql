-- AlterTable
ALTER TABLE "payments" ADD COLUMN     "method" TEXT,
ADD COLUMN     "provider" "PaymentProvider" NOT NULL DEFAULT 'STRIPE',
ADD COLUMN     "paidAt" TIMESTAMP(3);
