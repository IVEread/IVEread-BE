-- CreateTable
CREATE TABLE "DailyRecord" (
    "id" TEXT NOT NULL,
    "readDate" DATE NOT NULL,
    "note" TEXT,
    "userId" TEXT NOT NULL,
    "groupId" TEXT NOT NULL,
    "bookIsbn" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DailyRecord_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DailyRecordReaction" (
    "id" TEXT NOT NULL,
    "emoji" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "dailyRecordId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DailyRecordReaction_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "DailyRecord_userId_groupId_readDate_key" ON "DailyRecord"("userId", "groupId", "readDate");

-- CreateIndex
CREATE UNIQUE INDEX "DailyRecordReaction_userId_dailyRecordId_key" ON "DailyRecordReaction"("userId", "dailyRecordId");

-- AddForeignKey
ALTER TABLE "DailyRecord" ADD CONSTRAINT "DailyRecord_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DailyRecord" ADD CONSTRAINT "DailyRecord_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "Group"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DailyRecord" ADD CONSTRAINT "DailyRecord_bookIsbn_fkey" FOREIGN KEY ("bookIsbn") REFERENCES "Book"("isbn") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DailyRecordReaction" ADD CONSTRAINT "DailyRecordReaction_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DailyRecordReaction" ADD CONSTRAINT "DailyRecordReaction_dailyRecordId_fkey" FOREIGN KEY ("dailyRecordId") REFERENCES "DailyRecord"("id") ON DELETE CASCADE ON UPDATE CASCADE;
