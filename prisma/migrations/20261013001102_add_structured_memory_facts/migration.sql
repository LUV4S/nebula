-- CreateTable
CREATE TABLE "MemoryFact" (
    "id" TEXT NOT NULL,
    "conversationId" TEXT NOT NULL,
    "category" TEXT NOT NULL DEFAULT 'general',
    "subject" TEXT NOT NULL DEFAULT '',
    "content" TEXT NOT NULL,
    "originalText" TEXT NOT NULL,
    "certainty" TEXT NOT NULL DEFAULT 'uncertain',
    "source" TEXT NOT NULL DEFAULT 'conversation',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MemoryFact_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "MemoryFact_conversationId_createdAt_idx" ON "MemoryFact"("conversationId", "createdAt");

-- AddForeignKey
ALTER TABLE "MemoryFact" ADD CONSTRAINT "MemoryFact_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "Conversation"("id") ON DELETE CASCADE ON UPDATE CASCADE;
