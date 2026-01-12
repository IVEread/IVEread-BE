export interface CreateSentenceDto {
    content: string;
    pageNo: number;
    thought?: string;
    bookIsbn: string;
}

export interface UpdateSentenceDto {
    content: string;
    pageNo: number;
    thought?: string;
}

export interface SentenceResponseDto {
    id: string;
    content: string;
    pageNo: number;
    thought: string | null;
    createdAt: Date;

    userInfo: {
        id: string;
        nickname: string;
        profileImage: string | null;
    }

    bookInfo: {
        isbn: string;
        title: string;
        coverImage: string;
    }
}