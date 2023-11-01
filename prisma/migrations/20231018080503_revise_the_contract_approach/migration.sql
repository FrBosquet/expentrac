/*
  Warnings:

  - You are about to drop the column `constractId` on the `Share` table. All the data in the column will be lost.
  - Added the required column `contractId` to the `Share` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Share" DROP CONSTRAINT "Share_constractId_fkey";

-- AlterTable
ALTER TABLE "Period" ADD COLUMN     "payday" INTEGER,
ADD COLUMN     "paymonth" INTEGER,
ADD COLUMN     "periodicity" TEXT;

-- AlterTable
ALTER TABLE "Share" DROP COLUMN "constractId",
ADD COLUMN     "contractId" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "Share" ADD CONSTRAINT "Share_contractId_fkey" FOREIGN KEY ("contractId") REFERENCES "Contract"("id") ON DELETE CASCADE ON UPDATE CASCADE;
