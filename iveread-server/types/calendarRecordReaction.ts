export interface CreateCalendarRecordReactionDto {
    emoji: string;
}

export interface UpdateCalendarRecordReactionDto {
    emoji?: string;
}

export interface CalendarRecordReactionResponseDto {
    id: string;
    emoji: string;
    createdAt: Date;

    userId: string;
    userNickname: string;
    userProfileEmoji: string | null;

    calendarRecordId: string;
}
