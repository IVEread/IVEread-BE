export interface CreateRecordReactionDto {
    emoji: string;
}

export interface UpdateRecordReactionDto {
    emoji?: string;
}

export interface RecordReactionResponseDto {
    id: string;
    emoji: string;
    createdAt: Date;

    userId: string;
    userNickname: string;
    userProfileEmoji: string | null;

    recordId: string;
}
