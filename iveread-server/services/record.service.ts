import { db } from "@/lib/db";
import { CreateRecordDto, UpdateRecordDto, RecordResponseDto } from "@/types/record";
import { ERROR_CODES } from "@/app/constants/errorCodes";

export const createRecord = async (userId: string, groupId: string, data: CreateRecordDto): Promise<RecordResponseDto> => {
    
    const isMember = await db.groupMember.findUnique({
        where: {
            userId_groupId: { userId, groupId }
        }
    });

    if (!isMember) {
        throw new Error(ERROR_CODES.NOT_GROUP_MEMBER);
    }
    
    const newRecord = await db.readingRecord.create({
        data: {
            readDate: new Date(data.readDate),
            startPage: data.startPage,
            endPage: data.endPage,
            comment: data.comment,
            imageUrl: data.imageUrl,

            user: { connect: { id: userId } },
            group: { connect: { id: groupId } },
            book: { connect: { isbn: data.bookIsbn } },
        },
        include: {
            user: true,
            book: true,
        }
    });

    return {
        id: newRecord.id,
        readDate: newRecord.readDate,
        startPage: newRecord.startPage,
        endPage: newRecord.endPage,
        comment: newRecord.comment,
        imageUrl: newRecord.imageUrl,
        createdAt: newRecord.createdAt,
        
        userId: newRecord.user.id,
        userNickname: newRecord.user.nickname,
        userProfileEmoji: newRecord.user.emoji,

        bookIsbn: newRecord.book.isbn,
        bookTitle: newRecord.book.title,
        bookCoverImage: newRecord.book.coverImage,
    }
}

export const getRecords = async (groupId: string): Promise<RecordResponseDto[]> => {
    
    const records = await db.readingRecord.findMany({
        orderBy: { createdAt: 'desc' },
        where: { groupId: groupId },
        include: {
            user: true,
            book: true
        }
    });

    return records.map(record => ({
        id: record.id,
        readDate: record.readDate,
        startPage: record.startPage,
        endPage: record.endPage,
        comment: record.comment,
        imageUrl: record.imageUrl,
        createdAt: record.createdAt,
        
        userId: record.user.id,
        userNickname: record.user.nickname,
        userProfileEmoji: record.user.emoji,

        bookIsbn: record.book.isbn,
        bookTitle: record.book.title,
        bookCoverImage: record.book.coverImage,
    }));
}

export const updateRecord = async (userId: string, recordId: string, data: UpdateRecordDto): Promise<RecordResponseDto> => {
    try {
        const existing = await db.readingRecord.findUnique({
            where: { id: recordId }
        });

        if (!existing) {
            throw new Error(ERROR_CODES.RECORD_NOT_FOUND);
        }

        if (existing.userId !== userId) {
            throw new Error(ERROR_CODES.NOT_RECORD_OWNER);
        }

        const updatedRecord = await db.readingRecord.update({
            where: { 
                id: recordId,
                userId: userId
            },
            data: {
                startPage: data.startPage,
                endPage: data.endPage,
                comment: data.comment,
                imageUrl: data.imageUrl
            },
            include: { 
                user: true,
                book: true
            }
        });

        return {
            id: updatedRecord.id,
            readDate: updatedRecord.readDate,
            startPage: updatedRecord.startPage,
            endPage: updatedRecord.endPage,
            comment: updatedRecord.comment,
            imageUrl: updatedRecord.imageUrl,
            createdAt: updatedRecord.createdAt,
            
            userId: updatedRecord.user.id,
            userNickname: updatedRecord.user.nickname,
            userProfileEmoji: updatedRecord.user.emoji,

            bookIsbn: updatedRecord.book.isbn,
            bookTitle: updatedRecord.book.title,
            bookCoverImage: updatedRecord.book.coverImage,
        }

    } catch (error: any) {
        if (error.code === 'P2025') {
            throw new Error(ERROR_CODES.RECORD_NOT_FOUND);
        }
        throw error;
    }
}

export const deleteRecord = async (userId: string, recordId: string) => {
    try {
        const existing = await db.readingRecord.findUnique({
            where: { id: recordId }
        });

        if (!existing) {
            throw new Error(ERROR_CODES.RECORD_NOT_FOUND);
        }

        if (existing.userId !== userId) {
            throw new Error(ERROR_CODES.NOT_RECORD_OWNER);
        }
        
        await db.readingRecord.delete({
            where: {
                id: recordId,
                userId: userId
            }
        });
    } catch (error: any) {
        if (error.code === 'P2025') {
            throw new Error(ERROR_CODES.RECORD_NOT_FOUND);
        }
        throw error;
    }
}