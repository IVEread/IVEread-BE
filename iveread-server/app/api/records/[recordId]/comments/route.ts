import { NextResponse } from "next/server";
import { createRecordComment, getRecordComments } from "@/services/recordComment.service";
import { CreateRecordCommentDto, RecordCommentResponseDto } from "@/types/recordComment";
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
        const body = await request.json() as CreateRecordCommentDto;

        if (!body.content) {
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

        const newComment = await createRecordComment(userId, recordId, body);

        return NextResponse.json<ApiResponse<RecordCommentResponseDto>>(
            {
                success: true,
                data: newComment
            },
            { status: 201 } // Created
        );
    } catch (error: any) {
        console.error("독서 기록 댓글 생성 실패: ", error);

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

        if (error.message === ERROR_CODES.NOT_GROUP_MEMBER) {
            return NextResponse.json(
                {
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
                { status: 401 }
            );
        }

        const { recordId } = await params;
        const comments = await getRecordComments(recordId);

        return NextResponse.json<ApiResponse<RecordCommentResponseDto[]>>(
            {
                success: true,
                data: comments
            },
            { status: 200 }
        );
    } catch (error) {
        console.error("독서 기록 댓글 조회 실패: ", error);

        return NextResponse.json(
            {
                success: false,
                error: {
                    code: ERROR_CODES.INTERNAL_SERVER_ERROR,
                    message: "서버 내부에 오류가 발생했습니다. "
                }
            },
            { status: 500 }
        );
    }
}
