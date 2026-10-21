/*
  Warnings:

  - A unique constraint covering the columns `[userId,characterId]` on the table `Conversation` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Conversation_userId_characterId_key" ON "Conversation"("userId", "characterId");
