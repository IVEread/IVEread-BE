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

export interface GroupMemberDto {
    id: string;
    nickname: string;
    emoji: string;
}

export interface GroupResponseDto {
    id: string;
    name: string;
    startDate: Date;
    goalDate: Date | null;
    bookIsbn: string;
    bookTitle: string;
    bookCover: string;
    memberCount: number;
    createdAt: Date;
    members?: GroupMemberDto[];
}

export interface UpdateGroupDto {
    name?: string;
    goalDate?: string;
}

export interface FinishedGroupDto {
    id: string;
    groupId: string;
    bookIsbn: string;
    bookTitle: string;
    bookCoverImage: string;
    bookAuthor: string;
    finishedAt: Date;
}