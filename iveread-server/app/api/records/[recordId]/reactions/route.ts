import { NextResponse } from "next/server";
import { createRecordReaction, getRecordReactions } from "@/services/recordReaction.service";
import { CreateRecordReactionDto, RecordReactionResponseDto } from "@/types/recordReaction";
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
        const body = await request.json() as CreateRecordReactionDto;

        if (!body.emoji) {
            return NextResponse.json(
                {
                    success: false,
                    error: {
                        code: ERROR_CODES.MISSING_FIELDS,
                        message: "필수 입력값이 누락되었습니다. "
                    }
                },
                { status: 400 }
            );
        }

        const newReaction = await createRecordReaction(userId, recordId, body);

        return NextResponse.json<ApiResponse<RecordReactionResponseDto>>(
            {
                success: true,
                data: newReaction
            },
            { status: 200 } // Ok
        );
    } catch (error: any) {
        console.error("독서 기록 반응 생성 실패: ", error);

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
                { status: 401 } // Unauthorized
            );
        }

        const { recordId } = await params;
        const reactions = await getRecordReactions(recordId);

        return NextResponse.json<ApiResponse<RecordReactionResponseDto[]>>(
            {
                success: true,
                data: reactions
            },
            { status: 200 } // Ok
        );
    } catch (error) {
        console.error("독서 기록 반응 조회 실패: ", error);

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
