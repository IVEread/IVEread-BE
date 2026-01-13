import { getFinishedBooks } from "@/services/group.service";
import { FinishedGroupDto } from "@/types/group";
import { NextResponse } from "next/server";
import { ApiResponse } from "@/types/response";

export async function GET(request: Request) {
    try {
        const userId = request.headers.get("x-user-id");     
        if (!userId) {
            return NextResponse.json(
                {
                    success: false,
                    error: {
                        code: "UNAUTHORIZED",
                        message: "로그인이 필요합니다. "
                    }
                },
                { status: 401 } // Unauthorized
            );
        }
        const finishedBooks = await getFinishedBooks(userId);
        return NextResponse.json<ApiResponse<FinishedGroupDto[]>>(
            {
                success: true,
                data: finishedBooks
            },
            { status: 200 } // Ok
        );
    } catch (error: any) {
        console.error("완독한 책 조회 실패: ", error); 
        return NextResponse.json(
            {
                success: false,
                error: {
                    code: "INTERNAL_SERVER_ERROR",
                    message: "서버 내부 오류가 발생했습니다. "
                }
            },
            { status: 500 } // Internal Server Error
        );
    }
}