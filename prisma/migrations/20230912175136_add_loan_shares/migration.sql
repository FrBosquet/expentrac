-- AlterTable
ALTER TABLE "Loan" ADD COLUMN     "sharedWithIds" TEXT[];

-- CreateTable
CREATE TABLE "_LoanSharedWithRelation" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_LoanSharedWithRelation_AB_unique" ON "_LoanSharedWithRelation"("A", "B");

-- CreateIndex
CREATE INDEX "_LoanSharedWithRelation_B_index" ON "_LoanSharedWithRelation"("B");

-- AddForeignKey
ALTER TABLE "_LoanSharedWithRelation" ADD CONSTRAINT "_LoanSharedWithRelation_A_fkey" FOREIGN KEY ("A") REFERENCES "Loan"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_LoanSharedWithRelation" ADD CONSTRAINT "_LoanSharedWithRelation_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
