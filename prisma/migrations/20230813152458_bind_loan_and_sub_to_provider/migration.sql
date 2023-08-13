-- AlterTable
ALTER TABLE "Loan" ADD COLUMN     "lenderId" TEXT,
ADD COLUMN     "platformId" TEXT,
ADD COLUMN     "vendorId" TEXT;

-- AlterTable
ALTER TABLE "Subscription" ADD COLUMN     "lenderId" TEXT,
ADD COLUMN     "platformId" TEXT,
ADD COLUMN     "vendorId" TEXT;

-- AddForeignKey
ALTER TABLE "Loan" ADD CONSTRAINT "Loan_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "UserProvider"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Loan" ADD CONSTRAINT "Loan_platformId_fkey" FOREIGN KEY ("platformId") REFERENCES "UserProvider"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Loan" ADD CONSTRAINT "Loan_lenderId_fkey" FOREIGN KEY ("lenderId") REFERENCES "UserProvider"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Subscription" ADD CONSTRAINT "Subscription_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "UserProvider"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Subscription" ADD CONSTRAINT "Subscription_platformId_fkey" FOREIGN KEY ("platformId") REFERENCES "UserProvider"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Subscription" ADD CONSTRAINT "Subscription_lenderId_fkey" FOREIGN KEY ("lenderId") REFERENCES "UserProvider"("id") ON DELETE CASCADE ON UPDATE CASCADE;
