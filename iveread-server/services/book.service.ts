import { db } from "@/lib/db";
import { ERROR_CODES } from "@/app/constants/errorCodes";
import { BookDto, BookSearchResponseDto } from "@/types/book";

const ALADIN_BASE_URL = "https://www.aladin.co.kr/ttb/api";

type AladinItem = {
    isbn?: string;
    isbn13?: string;
    title?: string;
    author?: string;
    publisher?: string;
    cover?: string;
    itemPage?: number;
    subInfo?: {
        itemPage?: number;
    };
};

type AladinSearchResponse = {
    totalResults?: number;
    item?: AladinItem[];
};

type AladinLookupResponse = {
    item?: AladinItem[];
};

const requireApiKey = () => {
    const key = process.env.ALADIN_TTB_KEY;
    if (!key) {
        throw new Error(ERROR_CODES.EXTERNAL_API_ERROR);
    }
    return key;
};

const mapAladinItemToBook = (item: AladinItem): BookDto => {
    const totalPage = item.subInfo?.itemPage ?? item.itemPage ?? null;
    return {
        isbn: item.isbn13 || item.isbn || "",
        title: item.title || "",
        author: item.author || "",
        publisher: item.publisher || "",
        coverImage: item.cover || "",
        totalPage: totalPage ?? null,
    };
};

const mapDbBookToDto = (book: {
    isbn: string;
    title: string;
    author: string;
    publisher: string;
    coverImage: string;
    totalPage: number | null;
}): BookDto => ({
    isbn: book.isbn,
    title: book.title,
    author: book.author,
    publisher: book.publisher,
    coverImage: book.coverImage,
    totalPage: book.totalPage,
});

const fetchAladin = async <T>(endpoint: string, params: Record<string, string>) => {
    const apiKey = requireApiKey();
    const url = new URL(`${ALADIN_BASE_URL}/${endpoint}`);
    url.search = new URLSearchParams({
        ttbkey: apiKey,
        output: "js",
        Version: "20131101",
        ...params,
    }).toString();

    const response = await fetch(url.toString(), { method: "GET" });
    if (!response.ok) {
        throw new Error(ERROR_CODES.EXTERNAL_API_ERROR);
    }
    return (await response.json()) as T;
};

export const searchBooks = async (query: string, page = 1, size = 10): Promise<BookSearchResponseDto> => {
    const data = await fetchAladin<AladinSearchResponse>("ItemSearch.aspx", {
        Query: query,
        QueryType: "Title",
        MaxResults: String(size),
        start: String(page),
        SearchTarget: "Book",
    });

    const items = (data.item ?? [])
        .map((item) => {
            const mapped = mapAladinItemToBook(item);
            if (!mapped.publisher) {
                console.warn("알라딘 검색 결과 publisher 없음:", {
                    query,
                    isbn: mapped.isbn,
                    title: mapped.title,
                });
            }
            return mapped;
        })
        .filter((book) => book.isbn);
    return {
        totalResults: data.totalResults ?? items.length,
        items,
    };
};

export const getBookByIsbn = async (isbn: string): Promise<BookDto> => {
    const existing = await db.book.findUnique({ where: { isbn } });
    if (existing) {
        return mapDbBookToDto(existing);
    }

    const data = await fetchAladin<AladinLookupResponse>("ItemLookUp.aspx", {
        ItemId: isbn,
        ItemIdType: "ISBN",
    });

    const item = data.item?.[0];
    if (!item) {
        throw new Error(ERROR_CODES.BOOK_NOT_FOUND);
    }

    const mapped = mapAladinItemToBook(item);
    if (!mapped.isbn) {
        throw new Error(ERROR_CODES.BOOK_NOT_FOUND);
    }

    const created = await db.book.create({
        data: {
            isbn: mapped.isbn,
            title: mapped.title,
            author: mapped.author,
            publisher: mapped.publisher,
            coverImage: mapped.coverImage,
            totalPage: mapped.totalPage,
        },
    });

    return mapDbBookToDto(created);
};
