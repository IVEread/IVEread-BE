export interface CreateCommentDto {
    content: string;
}

export interface UpdateCommentDto {
    content?: string;
}

export interface CommentResponseDto {
    id: string;
    content: string;
    createdAt: Date;

    userId: string;
    userNickname: string;
    userProfileEmoji: string | null;
    
    sentenceId: string;
}