import { NextResponse } from "next/server"
import { getUserProfile, updateUserProfile } from "@/services/user.service"
import { ApiResponse } from "@/types/response"
import { UserProfileResponseDto, UpdateUserDto } from "@/types/user"
import { ERROR_CODES } from "@/app/constants/errorCodes"

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

export async function PATCH(
    request: Request
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

        const body = await request.json() as UpdateUserDto;

        if (!body.nickname && !body.emoji) {
            return NextResponse.json(
                {
                    success: false,
                    error: {
                        code: ERROR_CODES.INVALID_REQUEST,
                        message: "변경할 내용이 없습니다. "
                    },
                },
                { status: 400 } // Bad Request
            )
        }
        
        const updatedUser = await updateUserProfile(userId, body);

        return NextResponse.json<ApiResponse<UserProfileResponseDto>>(
            { 
                success: true, 
                data: updatedUser 
            },
            { status: 200 }
    );

    } catch (error: any) {
        console.error("프로필 수정 에러: ", error);

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
            { success: false, 
                error: { 
                    code: ERROR_CODES.INTERNAL_SERVER_ERROR, 
                    message: '서버 내부에 오류가 발생했습니다. '
                } 
            },
            { status: 500 } // Internal Server Error
        );
    }

}