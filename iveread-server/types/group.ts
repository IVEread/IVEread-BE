export interface CreateGroupDto {
    name: string;
    startDate: string;
    goalDate: string;

    book: {
        isbn: string;
        title: string;
        author: string;
        publisher: string;
        coverImage: string;
        totalPage: number;
    }
}

export interface GroupResponseDto {
    id: string;
    name: string;
    startDate: Date;
    goalDate: Date | null;
    bookTitle: string;
    bookCover: string;
    memberCount: number;
    createdAt: Date;
}

export interface UpdatedGroupDto {
    name?: string;
    goalDate?: string;
}