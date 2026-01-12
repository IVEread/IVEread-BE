import { db } from "@/lib/db";
import { CreateCommentDto, UpdateCommentDto, CommentResponseDto } from "@/types/comment";
import { ERROR_CODES } from "@/app/constants/errorCodes";

export const createComment = async (userId: string, sentenceId: string, data: CreateCommentDto): Promise<CommentResponseDto> => {
    
    const sentence = await db.sentence.findUnique({
        where: { id: sentenceId }, 
        select: { id: true, groupId: true}
    });

    if (!sentence) {
        throw new Error(ERROR_CODES.SENTENCE_NOT_FOUND);
    }

    const isMember = await db.groupMember.findUnique({
        where: {
            userId_groupId: {
                userId: userId,
                groupId: sentence.groupId
            }
        }
    });

    if (!isMember) {
        throw new Error(ERROR_CODES.NOT_GROUP_MEMBER);
    }

    const newComment = await db.comment.create({
        data: {
            content: data.content,
            user: { connect: { id: userId } },
            sentence: { connect: { id: sentenceId }},
        },
        include: {
            user: true,
        }
    });

    return {
        id: newComment.id,
        content: newComment.content,
        createdAt: newComment.createdAt,
        userId: newComment.user.id,
        userNickname: newComment.user.nickname,
        userProfileEmoji: newComment.user.emoji,
        sentenceId: newComment.sentenceId
    }
}

export const getComments = async (sentenceId: string): Promise<CommentResponseDto[]> => {
    
    const comments = await db.comment.findMany({
        orderBy: { createdAt: 'desc' },
        where: { sentenceId: sentenceId },
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
        sentenceId: comment.sentenceId
    }));
}

export const updateComment = async (userId: string, commentId: string, data: UpdateCommentDto): Promise<CommentResponseDto> => {
    try {
        const existing = await db.comment.findUnique({
            where: { id: commentId }
        });

        if (!existing) {
            throw new Error(ERROR_CODES.COMMENT_NOT_FOUND);
        }

        if (existing.userId !== userId) {
            throw new Error(ERROR_CODES.NOT_COMMENT_OWNER);
        }

        const updatedComment = await db.comment.update({
            where: { 
                id: commentId,
                userId: userId
            },
            data: {
                content: data.content,
            },
            include: { user: true}
        });

        return {
            id: updatedComment.id,
            content: updatedComment.content,
            createdAt: updatedComment.createdAt,
            userId: updatedComment.user.id,
            userNickname: updatedComment.user.nickname,
            userProfileEmoji: updatedComment.user.emoji,
            sentenceId: updatedComment.sentenceId
        }

    } catch (error: any) {
        if (error.code === 'P2025') {
            throw new Error(ERROR_CODES.COMMENT_NOT_FOUND);
        }
        throw error;
    }
}

export const deleteComment = async (userId: string, commentId: string) => {
    try {
        const existing = await db.comment.findUnique({
            where: { id: commentId }
        });

        if (!existing) {
            throw new Error(ERROR_CODES.COMMENT_NOT_FOUND);
        }

        if (existing.userId !== userId) {
            throw new Error(ERROR_CODES.NOT_COMMENT_OWNER);
        }
        
        await db.comment.delete({
            where: {
                id: commentId,
                userId: userId
            }
        });
    } catch (error: any) {
        if (error.code === 'P2025') {
            throw new Error(ERROR_CODES.COMMENT_NOT_FOUND);
        }
        throw error;
    }
}