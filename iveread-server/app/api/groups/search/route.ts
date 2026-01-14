import { NextResponse } from "next/server";
import { ApiResponse } from "@/types/response";
import { ERROR_CODES } from "@/app/constants/errorCodes";
import { searchGroups } from "@/services/group.service";

export async function GET(
    request: Request,
) {
    try { 
        const userId = request.headers.get("x-user-id");
        
        if (!userId) {
            return NextResponse.json(
                {
                    success: false,
                    error: {
                        code: ERROR_CODES.UNAUTHORIZED,
                        message: "로그인이 필요합니다. "
                    }
                },
                { status: 401 } // Unauthorized
            );
        }

        const { searchParams } = new URL(request.url);
        const query = searchParams.get("query");

        if (!query) {
            return NextResponse.json(
                {
                    success: false,
                    error: {
                        code: ERROR_CODES.MISSING_FIELDS,
                        message: "검색어가 필요합니다. "
                    }
                },
                { status: 400 } // Bad Request
            );
        }

        const data = await searchGroups(userId, query);

        return NextResponse.json<ApiResponse<any>>(
            {
                success: true,
                data: data
            },
            { status: 200 } // Ok
        );

    } catch (error: any) {
        console.error("그룹 검색 실패: ", error);
        
        return NextResponse.json(
            {
                success: false,
                error: {
                    code: ERROR_CODES.INTERNAL_SERVER_ERROR,
                    message: "서버 내부 오류가 발생했습니다. "
                }
            },
            { status: 500 } // Internal Server Error
        );
    }
}