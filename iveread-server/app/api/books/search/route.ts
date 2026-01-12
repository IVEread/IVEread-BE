import { NextResponse } from "next/server";
import { searchBooks } from "@/services/book.service";
import { BookSearchResponseDto } from "@/types/book";
import { ApiResponse } from "@/types/response";
import { ERROR_CODES } from "@/app/constants/errorCodes";

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const query = searchParams.get("query")?.trim();
        const page = Number(searchParams.get("page") || "1");
        const size = Number(searchParams.get("size") || "10");

        if (!query) {
            return NextResponse.json(
                {
                    success: false,
                    error: {
                        code: ERROR_CODES.MISSING_FIELDS,
                        message: "검색어가 필요합니다. ",
                    },
                },
                { status: 400 }
            );
        }

        const data = await searchBooks(query, page, size);

        return NextResponse.json<ApiResponse<BookSearchResponseDto>>(
            {
                success: true,
                data,
            },
            { status: 200 }
        );
    } catch (error: any) {
        console.error("도서 검색 실패:", error);

        if (error.message === ERROR_CODES.EXTERNAL_API_ERROR) {
            return NextResponse.json(
                {
                    success: false,
                    error: {
                        code: ERROR_CODES.EXTERNAL_API_ERROR,
                        message: "외부 API 호출에 실패했습니다. ",
                    },
                },
                { status: 502 }
            );
        }

        return NextResponse.json(
            {
                success: false,
                error: {
                    code: ERROR_CODES.INTERNAL_SERVER_ERROR,
                    message: "서버 내부에 오류가 발생했습니다. ",
                },
            },
            { status: 500 }
        );
    }
}
