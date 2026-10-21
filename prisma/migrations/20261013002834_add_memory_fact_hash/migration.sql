/*
  Warnings:

  - A unique constraint covering the columns `[conversationId,contentHash]` on the table `MemoryFact` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "MemoryFact" ADD COLUMN     "contentHash" VARCHAR(64);

-- CreateIndex
CREATE UNIQUE INDEX "MemoryFact_conversationId_contentHash_key" ON "MemoryFact"("conversationId", "contentHash");
