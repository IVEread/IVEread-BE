export interface CreateCalendarRecordDto {
    groupId: string;
    readDate: string;
    note: string;
}

export interface CalendarRecordResponseDto {
    id: string;
    readDate: Date;
    note: string | null;
    createdAt: Date;

    userId: string;
    userNickname: string;
    userProfileEmoji: string | null;

    groupId: string;
    bookIsbn: string;
    bookTitle: string;
    bookCoverImage: string;
}
