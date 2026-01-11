import { NextResponse } from "next/server";
import { joinGroup } from "@/services/group.service";
import { ApiResponse } from "@/types/response";
import { ERROR_CODES } from "@/app/constants/errorCodes";

export async function POST(
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
        await joinGroup(userId, groupId);

        return NextResponse.json<ApiResponse<null>>(
            {
            success: true,
            data: null,
            message: "그룹에 참여했습니다! "
            },
            { status: 201 } // Created
        ); 
    } catch (error: any) {
        console.log("그룹 참여 실패: ", error);

        if (error.message === ERROR_CODES.ALREADY_JOINED) {
            return NextResponse.json(
                { 
                    success: false, 
                    error: { 
                        code: ERROR_CODES.ALREADY_JOINED, 
                        message: "이미 참여 중인 그룹입니다. " } 
                    },
                { status: 409 } // Conflict
            );
        }

        if (error.message === ERROR_CODES.GROUP_NOT_FOUND) {
            return NextResponse.json(
                { 
                    success: false, 
                    error: { 
                        code: ERROR_CODES.GROUP_NOT_FOUND, 
                        message: "존재하지 않는 그룹입니다. " } 
                    },
                { status: 404 } // Not Found
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