import { NextResponse } from "next/server";
import { getBookByIsbn } from "@/services/book.service";
import { BookDto } from "@/types/book";
import { ApiResponse } from "@/types/response";
import { ERROR_CODES } from "@/app/constants/errorCodes";

export async function GET(
    request: Request,
    { params }: { params: Promise<{ bookID: string }> }
) {
    try {
        const { bookID } = await params;

        if (!bookID) {
            return NextResponse.json(
                {
                    success: false,
                    error: {
                        code: ERROR_CODES.INVALID_REQUEST,
                        message: "잘못된 요청입니다. ",
                    },
                },
                { status: 400 }
            );
        }

        const data = await getBookByIsbn(bookID);

        return NextResponse.json<ApiResponse<BookDto>>(
            {
                success: true,
                data,
            },
            { status: 200 }
        );
    } catch (error: any) {
        console.error("도서 상세 조회 실패:", error);

        if (error.message === ERROR_CODES.BOOK_NOT_FOUND) {
            return NextResponse.json(
                {
                    success: false,
                    error: {
                        code: ERROR_CODES.BOOK_NOT_FOUND,
                        message: "도서를 찾을 수 없습니다. ",
                    },
                },
                { status: 404 }
            );
        }

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
