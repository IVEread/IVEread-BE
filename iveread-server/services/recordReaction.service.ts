import { db } from "@/lib/db";
import { CreateRecordReactionDto, UpdateRecordReactionDto, RecordReactionResponseDto } from "@/types/recordReaction";
import { ERROR_CODES } from "@/app/constants/errorCodes";

export const createRecordReaction = async (
    userId: string,
    recordId: string,
    data: CreateRecordReactionDto
): Promise<RecordReactionResponseDto> => {
    const record = await db.readingRecord.findUnique({
        where: { id: recordId },
        select: { id: true, groupId: true }
    });

    if (!record) {
        throw new Error(ERROR_CODES.RECORD_NOT_FOUND);
    }

    const isMember = await db.groupMember.findUnique({
        where: {
            userId_groupId: { userId, groupId: record.groupId }
        }
    });

    if (!isMember) {
        throw new Error(ERROR_CODES.NOT_GROUP_MEMBER);
    }

    const reaction = await db.recordReaction.upsert({
        where: {
            userId_recordId: { userId, recordId }
        },
        update: {
            emoji: data.emoji
        },
        create: {
            emoji: data.emoji,
            user: { connect: { id: userId } },
            record: { connect: { id: recordId } }
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
        recordId: reaction.recordId
    };
};

export const getRecordReactions = async (recordId: string): Promise<RecordReactionResponseDto[]> => {
    const reactions = await db.recordReaction.findMany({
        orderBy: { createdAt: "desc" },
        where: { recordId },
        include: {
            user: true
        }
    });

    return reactions.map(reaction => ({
        id: reaction.id,
        emoji: reaction.emoji,
        createdAt: reaction.createdAt,
        userId: reaction.user.id,
        userNickname: reaction.user.nickname,
        userProfileEmoji: reaction.user.emoji,
        recordId: reaction.recordId
    }));
};

export const updateRecordReaction = async (
    userId: string,
    reactionId: string,
    data: UpdateRecordReactionDto
): Promise<RecordReactionResponseDto> => {
    try {
        const existing = await db.recordReaction.findUnique({
            where: { id: reactionId }
        });

        if (!existing) {
            throw new Error(ERROR_CODES.REACTION_NOT_FOUND);
        }

        if (existing.userId !== userId) {
            throw new Error(ERROR_CODES.NOT_REACTION_OWNER);
        }

        const updated = await db.recordReaction.update({
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
            recordId: updated.recordId
        };
    } catch (error: any) {
        if (error.code === "P2025") {
            throw new Error(ERROR_CODES.REACTION_NOT_FOUND);
        }
        throw error;
    }
};

export const deleteRecordReaction = async (userId: string, reactionId: string) => {
    try {
        const existing = await db.recordReaction.findUnique({
            where: { id: reactionId }
        });

        if (!existing) {
            throw new Error(ERROR_CODES.REACTION_NOT_FOUND);
        }

        if (existing.userId !== userId) {
            throw new Error(ERROR_CODES.NOT_REACTION_OWNER);
        }

        await db.recordReaction.delete({
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
