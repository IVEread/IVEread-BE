import { NextResponse } from "next/server";
import { ApiResponse } from "@/types/response";
import { ERROR_CODES } from "@/app/constants/errorCodes";
import {
    createCalendarRecordReaction,
    getCalendarRecordReactions
} from "@/services/calendarRecordReaction.service";
import { CalendarRecordReactionResponseDto, CreateCalendarRecordReactionDto } from "@/types/calendarRecordReaction";

export async function GET(
    request: Request,
    { params }: { params: Promise<{ recordId: string }> }
) {
    try {
        const { recordId } = await params;
        const reactions = await getCalendarRecordReactions(recordId);

        return NextResponse.json<ApiResponse<CalendarRecordReactionResponseDto[]>>(
            {
                success: true,
                data: reactions
            },
            { status: 200 }
        );
    } catch (error: any) {
        console.error("캘린더 반응 조회 실패:", error);
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
                        message: "로그인이 필요합니다."
                    }
                },
                { status: 401 }
            );
        }

        const body = await request.json() as CreateCalendarRecordReactionDto;
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

        const { recordId } = await params;
        const reaction = await createCalendarRecordReaction(userId, recordId, body);

        return NextResponse.json<ApiResponse<CalendarRecordReactionResponseDto>>(
            {
                success: true,
                data: reaction
            },
            { status: 201 }
        );
    } catch (error: any) {
        if (error.message === ERROR_CODES.DAILY_RECORD_NOT_FOUND) {
            return NextResponse.json(
                {
                    success: false,
                    error: {
                        code: ERROR_CODES.DAILY_RECORD_NOT_FOUND,
                        message: "기록을 찾을 수 없습니다."
                    }
                },
                { status: 404 }
            );
        }

        if (error.message === ERROR_CODES.NOT_FRIEND) {
            return NextResponse.json(
                {
                    success: false,
                    error: {
                        code: ERROR_CODES.NOT_FRIEND,
                        message: "친구가 아닌 사용자입니다."
                    }
                },
                { status: 403 }
            );
        }

        console.error("캘린더 반응 생성 실패:", error);
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
