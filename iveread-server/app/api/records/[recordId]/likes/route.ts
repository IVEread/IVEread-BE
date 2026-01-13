import { NextResponse } from "next/server";
import { toggleRecordLike, getLikeCount } from "@/services/record.service";
import { ApiResponse } from "@/types/response";
import { ERROR_CODES } from "@/app/constants/errorCodes";

export async function POST(
    request: Request,
    { params }: { params: Promise<{ recordId: string }> }
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
        const { recordId } = await params;
        const result = await toggleRecordLike(userId, recordId);

        return NextResponse.json<ApiResponse<{ liked: boolean; likeCount: number }>>(
            {
                success: true,
                data: result
            },
            { status: 200 } // Ok
        );
    } catch (error: any) {
        console.error("독서 기록 좋아요 실패: ", error);

        if (error.message === ERROR_CODES.RECORD_NOT_FOUND) {
            return NextResponse.json(
                {
                    success: false,
                    error: {
                        code: ERROR_CODES.RECORD_NOT_FOUND,
                        message: "독서 기록을 찾을 수 없습니다. "
                    }
                },
                { status: 404 } // Not Found
            );
        } else if (error.message === ERROR_CODES.NOT_GROUP_MEMBER) {
            return NextResponse.json({
                success: false,
                error: {
                    code: ERROR_CODES.NOT_GROUP_MEMBER,
                    message: "그룹의 멤버가 아닙니다. "
                }
            },
            { status: 403 } // Forbidden
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
        );
    }
}

export async function GET(
    request: Request,
    { params }: { params: Promise<{ recordId: string }> }  
) {
    try {
        const { recordId } = await params;
        const likeCount = await getLikeCount(recordId);
        return NextResponse.json<ApiResponse<{ likeCount: number }>>(
            {
                success: true,
                data: { likeCount }
            },
            { status: 200 } // Ok
        );
    } catch (error: any) {  
        console.error("독서 기록 좋아요 수 조회 실패: ", error);

        if (error.message === ERROR_CODES.RECORD_NOT_FOUND) {
            return NextResponse.json(
                {
                    success: false,
                    error: {
                        code: ERROR_CODES.RECORD_NOT_FOUND,
                        message: "독서 기록을 찾을 수 없습니다. "
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
                    message: "서버 내부에 오류가 발생했습니다. "
                }
            },
            { status: 500 } // Internal Server Error
        );
    }
}