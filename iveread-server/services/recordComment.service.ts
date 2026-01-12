import { db } from "@/lib/db";
import { CreateRecordCommentDto, UpdateRecordCommentDto, RecordCommentResponseDto } from "@/types/recordComment";
import { ERROR_CODES } from "@/app/constants/errorCodes";

export const createRecordComment = async (
    userId: string,
    recordId: string,
    data: CreateRecordCommentDto
): Promise<RecordCommentResponseDto> => {
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

    const newComment = await db.recordComment.create({
        data: {
            content: data.content,
            user: { connect: { id: userId } },
            record: { connect: { id: recordId } }
        },
        include: {
            user: true
        }
    });

    return {
        id: newComment.id,
        content: newComment.content,
        createdAt: newComment.createdAt,
        userId: newComment.user.id,
        userNickname: newComment.user.nickname,
        userProfileEmoji: newComment.user.emoji,
        recordId: newComment.recordId
    };
};

export const getRecordComments = async (recordId: string): Promise<RecordCommentResponseDto[]> => {
    const comments = await db.recordComment.findMany({
        orderBy: { createdAt: "desc" },
        where: { recordId },
        include: {
            user: true
        }
    });

    return comments.map(comment => ({
        id: comment.id,
        content: comment.content,
        createdAt: comment.createdAt,
        userId: comment.user.id,
        userNickname: comment.user.nickname,
        userProfileEmoji: comment.user.emoji,
        recordId: comment.recordId
    }));
};

export const updateRecordComment = async (
    userId: string,
    commentId: string,
    data: UpdateRecordCommentDto
): Promise<RecordCommentResponseDto> => {
    try {
        const existing = await db.recordComment.findUnique({
            where: { id: commentId }
        });

        if (!existing) {
            throw new Error(ERROR_CODES.COMMENT_NOT_FOUND);
        }

        if (existing.userId !== userId) {
            throw new Error(ERROR_CODES.NOT_COMMENT_OWNER);
        }

        const updated = await db.recordComment.update({
            where: {
                id: commentId,
                userId
            },
            data: {
                content: data.content
            },
            include: {
                user: true
            }
        });

        return {
            id: updated.id,
            content: updated.content,
            createdAt: updated.createdAt,
            userId: updated.user.id,
            userNickname: updated.user.nickname,
            userProfileEmoji: updated.user.emoji,
            recordId: updated.recordId
        };
    } catch (error: any) {
        if (error.code === "P2025") {
            throw new Error(ERROR_CODES.COMMENT_NOT_FOUND);
        }
        throw error;
    }
};

export const deleteRecordComment = async (userId: string, commentId: string) => {
    try {
        const existing = await db.recordComment.findUnique({
            where: { id: commentId }
        });

        if (!existing) {
            throw new Error(ERROR_CODES.COMMENT_NOT_FOUND);
        }

        if (existing.userId !== userId) {
            throw new Error(ERROR_CODES.NOT_COMMENT_OWNER);
        }

        await db.recordComment.delete({
            where: {
                id: commentId,
                userId
            }
        });
    } catch (error: any) {
        if (error.code === "P2025") {
            throw new Error(ERROR_CODES.COMMENT_NOT_FOUND);
        }
        throw error;
    }
};
