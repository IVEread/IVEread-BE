import { NextResponse } from "next/server";
import { addFriend, removeFriend, getFriends } from "@/services/friend.service";
import { ERROR_CODES } from "@/app/constants/errorCodes";
import { ApiResponse } from "@/types/response";
import { FriendResponseDto } from "@/types/friend";

export async function POST(request: Request) {
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

        const body = await request.json();
        const { targetId, action } = body;

        if (!targetId || !action) {
            return NextResponse.json(
                {
                    success: false,
                    error: {
                        code: ERROR_CODES.MISSING_FIELDS,
                        message: "필수 입력값이 누락되었습니다. "
                    }
                },
                { status: 400 } // Bad Request
            );
        }

        if (action === 'remove') {
            await removeFriend(userId, targetId);
            return NextResponse.json<ApiResponse<null>>({
                success: true,
                data: null,
                message: "친구 삭제가 완료되었습니다. "
            });

        } else if (action === 'add') {
            await addFriend(userId, targetId);
            return NextResponse.json<ApiResponse<null>>({
                success: true,
                data: null,
                message: "친구 추가가 완료되었습니다. "
            });
        } else {
            return NextResponse.json(
                {
                    success: false,
                    error: {
                        code: ERROR_CODES.INVALID_REQUEST,
                        message: "잘못된 action입니다. "
                    }
                },
                { status: 400 } // Bad Request
            );
        }
    } catch (error: any) {
        console.error("친구 관리 실패: ", error);

        if (error.message === ERROR_CODES.CANNOT_FOLLOW_SELF) {
            return NextResponse.json(
                {
                    success: false,
                    error: {
                        code: ERROR_CODES.CANNOT_FOLLOW_SELF,
                        message: "자기 자신은 친구로 추가할 수 없습니다. "
                    }
                },
                { status: 400 } // Bad Request
            );
        }

        if (error.message === ERROR_CODES.USER_NOT_FOUND) {
            return NextResponse.json(
                {
                    success: false,
                    error: {
                        code: ERROR_CODES.USER_NOT_FOUND,
                        message: "User not found."
                    }
                },
                { status: 404 }
            );
        }

        return NextResponse.json(
            {
                success: false,
                error: {
                    code: ERROR_CODES.INTERNAL_SERVER_ERROR,
                    message: "서버 내부에 오류가 발생했습니다."
                }
            },
            { status: 500 } // Internal Server Error
        );
    }
}

export async function GET(request: Request) {
    try {
        const userId = request.headers.get('x-user-id');
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
        
        const friends = await getFriends(userId);

        return NextResponse.json<ApiResponse<FriendResponseDto[]>>({
            success: true,
            data: friends
        });

    } catch (error: any) {
        console.error("친구 목록 조회 실패: ", error);
        return NextResponse.json(
            {
                success: false,
                error: {
                    code: ERROR_CODES.INTERNAL_SERVER_ERROR,
                    message: "서버 내부에 오류가 발생했습니다."
                }
            },
            { status: 500 } // Internal Server Error
        ); 
    }
}
