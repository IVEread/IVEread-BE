export interface CreateRecordDto {
    readDate: Date;
    startPage: number;
	endPage: number;
	comment?: string;
	imageUrl: string;    
    bookIsbn: string;
}

export interface UpdateRecordDto {
    startPage?: number;
	endPage?: number;
	comment?: string;
	imageUrl?: string;    
}

export interface RecordResponseDto {
    id: string;
    readDate: Date;
    startPage: number;
	endPage: number;
	comment?: string | null;
	imageUrl: string;
    createdAt: Date;
    
    userId: string;
    userNickname: string;
    userProfileEmoji: string | null;   

    bookIsbn: string;
    bookTitle: string;
    bookCoverImage: string;
}