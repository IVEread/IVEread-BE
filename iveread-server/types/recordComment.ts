export interface CreateRecordCommentDto {
    content: string;
}

export interface UpdateRecordCommentDto {
    content?: string;
}

export interface RecordCommentResponseDto {
    id: string;
    content: string;
    createdAt: Date;

    userId: string;
    userNickname: string;
    userProfileEmoji: string | null;

    recordId: string;
}
