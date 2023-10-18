/*
  Warnings:

  - You are about to drop the column `baseFee` on the `Contract` table. All the data in the column will be lost.
  - Added the required column `fee` to the `Period` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Contract" DROP COLUMN "baseFee",
ALTER COLUMN "fee" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Period" ADD COLUMN     "fee" DOUBLE PRECISION NOT NULL;
