import { NextResponse } from "next/server";
import { createCalendarRecord } from "@/services/calendarRecord.service";
import { ApiResponse } from "@/types/response";
import { CalendarRecordResponseDto, CreateCalendarRecordDto } from "@/types/calendarRecord";
import { ERROR_CODES } from "@/app/constants/errorCodes";

export async function POST(request: Request) {
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

        const body = await request.json() as CreateCalendarRecordDto;

        if (!body.groupId || !body.readDate || !body.note) {
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

        const record = await createCalendarRecord(userId, body);

        return NextResponse.json<ApiResponse<CalendarRecordResponseDto>>(
            {
                success: true,
                data: record
            },
            { status: 201 }
        );
    } catch (error: any) {
        if (error.message === ERROR_CODES.GROUP_NOT_FOUND) {
            return NextResponse.json(
                {
                    success: false,
                    error: {
                        code: ERROR_CODES.GROUP_NOT_FOUND,
                        message: "그룹을 찾을 수 없습니다."
                    }
                },
                { status: 404 }
            );
        }

        if (error.message === ERROR_CODES.NOT_GROUP_MEMBER) {
            return NextResponse.json(
                {
                    success: false,
                    error: {
                        code: ERROR_CODES.NOT_GROUP_MEMBER,
                        message: "그룹 멤버가 아닙니다."
                    }
                },
                { status: 403 }
            );
        }

        if (error.message === ERROR_CODES.DAILY_RECORD_ALREADY_EXISTS) {
            return NextResponse.json(
                {
                    success: false,
                    error: {
                        code: ERROR_CODES.DAILY_RECORD_ALREADY_EXISTS,
                        message: "해당 날짜의 기록이 이미 존재합니다."
                    }
                },
                { status: 409 }
            );
        }

        console.error("캘린더 기록 생성 실패:", error);
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
