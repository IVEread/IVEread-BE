import { db } from "@/lib/db";
import {
    CreateCalendarRecordReactionDto,
    UpdateCalendarRecordReactionDto,
    CalendarRecordReactionResponseDto
} from "@/types/calendarRecordReaction";
import { ERROR_CODES } from "@/app/constants/errorCodes";

const ensureCanReact = async (requesterId: string, recordId: string) => {
    const record = await db.dailyRecord.findUnique({
        where: { id: recordId },
        select: { id: true, userId: true }
    });

    if (!record) {
        throw new Error(ERROR_CODES.DAILY_RECORD_NOT_FOUND);
    }

    if (record.userId !== requesterId) {
        const friendship = await db.friendship.findUnique({
            where: {
                followerId_followingId: {
                    followerId: requesterId,
                    followingId: record.userId
                }
            }
        });

        if (!friendship) {
            throw new Error(ERROR_CODES.NOT_FRIEND);
        }
    }

    return record;
};

export const createCalendarRecordReaction = async (
    userId: string,
    recordId: string,
    data: CreateCalendarRecordReactionDto
): Promise<CalendarRecordReactionResponseDto> => {
    await ensureCanReact(userId, recordId);

    const reaction = await db.dailyRecordReaction.upsert({
        where: {
            userId_dailyRecordId: { userId, dailyRecordId: recordId }
        },
        update: {
            emoji: data.emoji
        },
        create: {
            emoji: data.emoji,
            user: { connect: { id: userId } },
            dailyRecord: { connect: { id: recordId } }
        },
        include: {
            user: true
        }
    });

    return {
        id: reaction.id,
        emoji: reaction.emoji,
        createdAt: reaction.createdAt,
        userId: reaction.user.id,
        userNickname: reaction.user.nickname,
        userProfileEmoji: reaction.user.emoji,
        calendarRecordId: reaction.dailyRecordId
    };
};

export const getCalendarRecordReactions = async (
    recordId: string
): Promise<CalendarRecordReactionResponseDto[]> => {
    const reactions = await db.dailyRecordReaction.findMany({
        orderBy: { createdAt: "desc" },
        where: { dailyRecordId: recordId },
        include: {
            user: true
        }
    });

    return reactions.map((reaction) => ({
        id: reaction.id,
        emoji: reaction.emoji,
        createdAt: reaction.createdAt,
        userId: reaction.user.id,
        userNickname: reaction.user.nickname,
        userProfileEmoji: reaction.user.emoji,
        calendarRecordId: reaction.dailyRecordId
    }));
};

export const updateCalendarRecordReaction = async (
    userId: string,
    reactionId: string,
    data: UpdateCalendarRecordReactionDto
): Promise<CalendarRecordReactionResponseDto> => {
    try {
        const existing = await db.dailyRecordReaction.findUnique({
            where: { id: reactionId }
        });

        if (!existing) {
            throw new Error(ERROR_CODES.REACTION_NOT_FOUND);
        }

        if (existing.userId !== userId) {
            throw new Error(ERROR_CODES.NOT_REACTION_OWNER);
        }

        const updated = await db.dailyRecordReaction.update({
            where: {
                id: reactionId,
                userId
            },
            data: {
                emoji: data.emoji
            },
            include: {
                user: true
            }
        });

        return {
            id: updated.id,
            emoji: updated.emoji,
            createdAt: updated.createdAt,
            userId: updated.user.id,
            userNickname: updated.user.nickname,
            userProfileEmoji: updated.user.emoji,
            calendarRecordId: updated.dailyRecordId
        };
    } catch (error: any) {
        if (error.code === "P2025") {
            throw new Error(ERROR_CODES.REACTION_NOT_FOUND);
        }
        throw error;
    }
};

export const deleteCalendarRecordReaction = async (userId: string, reactionId: string) => {
    try {
        const existing = await db.dailyRecordReaction.findUnique({
            where: { id: reactionId }
        });

        if (!existing) {
            throw new Error(ERROR_CODES.REACTION_NOT_FOUND);
        }

        if (existing.userId !== userId) {
            throw new Error(ERROR_CODES.NOT_REACTION_OWNER);
        }

        await db.dailyRecordReaction.delete({
            where: {
                id: reactionId,
                userId
            }
        });
    } catch (error: any) {
        if (error.code === "P2025") {
            throw new Error(ERROR_CODES.REACTION_NOT_FOUND);
        }
        throw error;
    }
};
