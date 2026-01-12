export interface BookDto {
    isbn: string;
    title: string;
    author: string;
    publisher: string;
    coverImage: string;
    totalPage: number | null;
}

export interface BookSearchResponseDto {
    totalResults: number;
    items: BookDto[];
}
