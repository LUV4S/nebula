-- AlterTable
ALTER TABLE "Conversation" ADD COLUMN     "memory" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "memoryUpdatedAt" TIMESTAMP(3);
