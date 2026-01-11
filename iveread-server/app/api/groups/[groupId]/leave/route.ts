import { NextResponse } from "next/server";
import { leaveGroup } from "@/services/group.service";
import { ApiResponse } from "@/types/response";
import { ERROR_CODES } from "@/app/constants/errorCodes";

export async function DELETE(
    request: Request,
    { params } : { params: Promise<{ groupId: string}> }
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
            )
        }

        const { groupId } = await params;
        await leaveGroup(userId, groupId);

        return NextResponse.json<ApiResponse<null>>(
            {
            success: true,
            data: null,
            message: "그룹을 탈퇴하였습니다. "
            },
            { status: 200 } // Ok
        ); 
    } catch (error: any) {
        console.log("그룹 탈퇴 실패: ", error);

        if (error.message === ERROR_CODES.NOT_MEMBER) {
            return NextResponse.json(
                { 
                    success: false, 
                    error: { 
                        code: ERROR_CODES.NOT_MEMBER, 
                        message: "가입하지 않은 그룹이거나 이미 탈퇴했습니다. " } 
                    },
                { status: 400 } // Bad Request
            );
        }

        return NextResponse.json(
            {
                success: false,
                error: {
                    code: ERROR_CODES.INTERNAL_SERVER_ERROR,
                    message: "서버 내부에 오류가 발생했습니다. "
                }
            },
            { status: 500 } // Internal Server Error
        )
    }
}