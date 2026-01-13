-- DropForeignKey
ALTER TABLE "ReadingRecord" DROP CONSTRAINT "ReadingRecord_groupId_fkey";

-- AddForeignKey
ALTER TABLE "ReadingRecord" ADD CONSTRAINT "ReadingRecord_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "Group"("id") ON DELETE CASCADE ON UPDATE CASCADE;
