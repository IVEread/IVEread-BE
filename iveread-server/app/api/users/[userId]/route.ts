import { NextResponse } from "next/server"
import { getUserProfile } from "@/services/user.service"
import { ApiResponse } from "@/types/response"
import { UserProfileResponseDto } from "@/types/user"
import { ERROR_CODES } from "@/app/constants/errorCodes"

export async function GET(
    request: Request,
    { params }: { params: Promise<{ userId: string }> }
) {
    try {
        const { userId } = await params;

        if (!userId) {
            return NextResponse.json(
                {
                    success: false,
                    error: {
                        code: ERROR_CODES.INVALID_REQUEST,
                        message: "잘못된 요청입니다. "
                    }
                },
                { status: 400 } // Bad Request
            )
        }

        const userProfile = await getUserProfile(userId);
        return NextResponse.json<ApiResponse<UserProfileResponseDto>>(
            {
                success: true,
                data: userProfile
            },
            { status: 200 } // Ok
        );

    }
    catch (error: any) {
        console.error("프로필 조회 에러: ", error);

        if (error.message === ERROR_CODES.USER_NOT_FOUND) {
            return NextResponse.json(
                {
                    success: false,
                    error: {
                        code: ERROR_CODES.USER_NOT_FOUND,
                        message: "사용자를 찾을 수 없습니다. "
                    },
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