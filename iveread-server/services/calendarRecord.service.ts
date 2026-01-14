import { db } from "@/lib/db";
import { CreateCalendarRecordDto, CalendarRecordResponseDto } from "@/types/calendarRecord";
import { ERROR_CODES } from "@/app/constants/errorCodes";

export const createCalendarRecord = async (
    userId: string,
    data: CreateCalendarRecordDto
): Promise<CalendarRecordResponseDto> => {
    const group = await db.group.findUnique({
        where: { id: data.groupId },
        include: { book: true }
    });

    if (!group) {
        throw new Error(ERROR_CODES.GROUP_NOT_FOUND);
    }

    const member = await db.groupMember.findUnique({
        where: {
            userId_groupId: { userId, groupId: data.groupId }
        }
    });

    if (!member) {
        throw new Error(ERROR_CODES.NOT_GROUP_MEMBER);
    }

    try {
        const record = await db.dailyRecord.create({
            data: {
                readDate: new Date(data.readDate),
                note: data.note,
                userId,
                groupId: data.groupId,
                bookIsbn: group.bookIsbn
            },
            include: {
                user: true,
                book: true
            }
        });

        return {
            id: record.id,
            readDate: record.readDate,
            note: record.note,
            createdAt: record.createdAt,
            userId: record.user.id,
            userNickname: record.user.nickname,
            userProfileEmoji: record.user.emoji,
            groupId: record.groupId,
            bookIsbn: record.book.isbn,
            bookTitle: record.book.title,
            bookCoverImage: record.book.coverImage
        };
    } catch (error: any) {
        if (error.code === "P2002") {
            throw new Error(ERROR_CODES.DAILY_RECORD_ALREADY_EXISTS);
        }
        throw error;
    }
};

export const getCalendarRecords = async (
    requesterId: string,
    userId: string,
    options?: { year?: number; month?: number }
): Promise<CalendarRecordResponseDto[]> => {
    const targetUser = await db.user.findUnique({
        where: { id: userId }
    });

    if (!targetUser) {
        throw new Error(ERROR_CODES.USER_NOT_FOUND);
    }

    if (requesterId !== userId) {
        const friendship = await db.friendship.findUnique({
            where: {
                followerId_followingId: {
                    followerId: requesterId,
                    followingId: userId
                }
            }
        });

        if (!friendship) {
            throw new Error(ERROR_CODES.NOT_FRIEND);
        }
    }

    const where: any = {
        userId
    };

    if (options?.year && options?.month) {
        const startDate = new Date(Date.UTC(options.year, options.month - 1, 1));
        const endDate = new Date(Date.UTC(options.year, options.month, 1));
        where.readDate = { gte: startDate, lt: endDate };
    }

    const records = await db.dailyRecord.findMany({
        orderBy: { readDate: "desc" },
        where,
        include: {
            user: true,
            book: true
        }
    });

    return records.map((record) => ({
        id: record.id,
        readDate: record.readDate,
        note: record.note,
        createdAt: record.createdAt,
        userId: record.user.id,
        userNickname: record.user.nickname,
        userProfileEmoji: record.user.emoji,
        groupId: record.groupId,
        bookIsbn: record.book.isbn,
        bookTitle: record.book.title,
        bookCoverImage: record.book.coverImage
    }));
};
