/*
  Warnings:

  - You are about to drop the column `sharedWithIds` on the `Loan` table. All the data in the column will be lost.
  - You are about to drop the `_LoanSharedWithRelation` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "_LoanSharedWithRelation" DROP CONSTRAINT "_LoanSharedWithRelation_A_fkey";

-- DropForeignKey
ALTER TABLE "_LoanSharedWithRelation" DROP CONSTRAINT "_LoanSharedWithRelation_B_fkey";

-- AlterTable
ALTER TABLE "Loan" DROP COLUMN "sharedWithIds";

-- DropTable
DROP TABLE "_LoanSharedWithRelation";

-- CreateTable
CREATE TABLE "LoanShare" (
    "id" TEXT NOT NULL,
    "loanId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "accepted" BOOLEAN,

    CONSTRAINT "LoanShare_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "LoanShare" ADD CONSTRAINT "LoanShare_loanId_fkey" FOREIGN KEY ("loanId") REFERENCES "Loan"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LoanShare" ADD CONSTRAINT "LoanShare_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
