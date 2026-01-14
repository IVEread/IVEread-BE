import { NextResponse } from "next/server";
import { ApiResponse } from "@/types/response";
import { ERROR_CODES } from "@/app/constants/errorCodes";
import {
    deleteCalendarRecordReaction,
    updateCalendarRecordReaction
} from "@/services/calendarRecordReaction.service";
import { CalendarRecordReactionResponseDto, UpdateCalendarRecordReactionDto } from "@/types/calendarRecordReaction";

export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ reactionId: string }> }
) {
    try {
        const userId = request.headers.get("x-user-id");

        if (!userId) {
            return NextResponse.json(
                {
                    success: false,
                    error: {
                        code: ERROR_CODES.UNAUTHORIZED,
                        message: "로그인이 필요합니다."
                    }
                },
                { status: 401 }
            );
        }

        const body = await request.json() as UpdateCalendarRecordReactionDto;
        if (!body.emoji) {
            return NextResponse.json(
                {
                    success: false,
                    error: {
                        code: ERROR_CODES.MISSING_FIELDS,
                        message: "필수 입력값이 누락되었습니다."
                    }
                },
                { status: 400 }
            );
        }

        const { reactionId } = await params;
        const reaction = await updateCalendarRecordReaction(userId, reactionId, body);

        return NextResponse.json<ApiResponse<CalendarRecordReactionResponseDto>>(
            {
                success: true,
                data: reaction
            },
            { status: 200 }
        );
    } catch (error: any) {
        if (error.message === ERROR_CODES.REACTION_NOT_FOUND) {
            return NextResponse.json(
                {
                    success: false,
                    error: {
                        code: ERROR_CODES.REACTION_NOT_FOUND,
                        message: "반응을 찾을 수 없습니다."
                    }
                },
                { status: 404 }
            );
        }

        if (error.message === ERROR_CODES.NOT_REACTION_OWNER) {
            return NextResponse.json(
                {
                    success: false,
                    error: {
                        code: ERROR_CODES.NOT_REACTION_OWNER,
                        message: "본인 반응만 수정할 수 있습니다."
                    }
                },
                { status: 403 }
            );
        }

        console.error("캘린더 반응 수정 실패:", error);
        return NextResponse.json(
            {
                success: false,
                error: {
                    code: ERROR_CODES.INTERNAL_SERVER_ERROR,
                    message: "서버 오류가 발생했습니다."
                }
            },
            { status: 500 }
        );
    }
}

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ reactionId: string }> }
) {
    try {
        const userId = request.headers.get("x-user-id");

        if (!userId) {
            return NextResponse.json(
                {
                    success: false,
                    error: {
                        code: ERROR_CODES.UNAUTHORIZED,
                        message: "로그인이 필요합니다."
                    }
                },
                { status: 401 }
            );
        }

        const { reactionId } = await params;
        await deleteCalendarRecordReaction(userId, reactionId);

        return NextResponse.json<ApiResponse<null>>(
            {
                success: true,
                data: null
            },
            { status: 200 }
        );
    } catch (error: any) {
        if (error.message === ERROR_CODES.REACTION_NOT_FOUND) {
            return NextResponse.json(
                {
                    success: false,
                    error: {
                        code: ERROR_CODES.REACTION_NOT_FOUND,
                        message: "반응을 찾을 수 없습니다."
                    }
                },
                { status: 404 }
            );
        }

        if (error.message === ERROR_CODES.NOT_REACTION_OWNER) {
            return NextResponse.json(
                {
                    success: false,
                    error: {
                        code: ERROR_CODES.NOT_REACTION_OWNER,
                        message: "본인 반응만 삭제할 수 있습니다."
                    }
                },
                { status: 403 }
            );
        }

        console.error("캘린더 반응 삭제 실패:", error);
        return NextResponse.json(
            {
                success: false,
                error: {
                    code: ERROR_CODES.INTERNAL_SERVER_ERROR,
                    message: "서버 오류가 발생했습니다."
                }
            },
            { status: 500 }
        );
    }
}
