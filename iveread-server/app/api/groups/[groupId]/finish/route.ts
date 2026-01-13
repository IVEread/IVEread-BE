import { NextResponse } from "next/server";
import { ApiResponse } from "@/types/response";
import { ERROR_CODES } from "@/app/constants/errorCodes";
import { finishGroupRead } from "@/services/group.service";

export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ groupId: string }> }
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

        const { groupId } = await params;
        await finishGroupRead(userId, groupId);

        return NextResponse.json<ApiResponse<null>>(
            {
                success: true,
                data: null
            },
            { status: 200 } // Ok
        );
    } catch (error: any) {
        console.error("그룹 독서 완료 처리 실패: ", error);
        
        if (error.message === ERROR_CODES.NOT_GROUP_MEMBER) {
            return NextResponse.json({
                success: false,
                error: {
                    code: ERROR_CODES.NOT_GROUP_MEMBER,
                    message: "그룹의 멤버가 아닙니다. "
                }
            },
            { status: 404 } // Not Found
            );
        }

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