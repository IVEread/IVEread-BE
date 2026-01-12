export interface CreateSentenceDto {
    content: string;
    pageNo: number;
    thought?: string;
    bookIsbn: string;
}

export interface UpdateSentenceDto {
    content?: string;
    pageNo?: number;
    thought?: string;
}

export interface SentenceResponseDto {
    id: string;
    content: string;
    pageNo: number;
    thought: string | null;
    createdAt: Date;

    userId: string;
    userNickname: string;
    userProfileEmoji: string | null;

    bookIsbn: string;
    bookTitle: string;
    bookCoverImage: string;
}