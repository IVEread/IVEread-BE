import { NextResponse } from "next/server";
import { getRecords } from "@/services/record.service";
import { ApiResponse } from "@/types/response";
import { RecordResponseDto } from "@/types/record";
import { ERROR_CODES } from "@/app/constants/errorCodes";

export async function GET(
    request: Request,
    { params }: { params: Promise<{ userId: string }> }
) {
    try {
        const requesterId = request.headers.get("x-user-id");

        if (!requesterId) {
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

        const { userId } = await params;
        if (!userId) {
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

        const { searchParams } = new URL(request.url);
        const yearParam = searchParams.get("year");
        const monthParam = searchParams.get("month");

        let year: number | undefined;
        let month: number | undefined;

        if (yearParam || monthParam) {
            if (!yearParam || !monthParam) {
                return NextResponse.json(
                    {
                        success: false,
                        error: {
                            code: ERROR_CODES.INVALID_REQUEST,
                            message: "연도와 월을 모두 입력해 주세요. "
                        }
                    },
                    { status: 400 } // Bad Request
                );
            }

            year = Number(yearParam);
            month = Number(monthParam);

            if (!Number.isInteger(year) || !Number.isInteger(month) || month < 1 || month > 12) {
                return NextResponse.json(
                    {
                        success: false,
                        error: {
                            code: ERROR_CODES.INVALID_REQUEST,
                            message: "유효하지 않은 연도 또는 월입니다. "
                        }
                    },
                    { status: 400 } // Bad Request
                );
            }
        }

        const records = await getRecords(requesterId, undefined, {
            userId,
            year,
            month
        });

        return NextResponse.json<ApiResponse<RecordResponseDto[]>>(
            {
                success: true,
                data: records
            },
            { status: 200 }
        );
    } catch (error: any) {
        if (error.message === ERROR_CODES.USER_NOT_FOUND) {
            return NextResponse.json(
                {
                    success: false,
                    error: {
                        code: ERROR_CODES.USER_NOT_FOUND,
                        message: "사용자를 찾을 수 없습니다. "
                    }
                },
                { status: 404 } // Not Found
            );
        }

        if (error.message === ERROR_CODES.NOT_FRIEND) {
            return NextResponse.json(
                {
                    success: false,
                    error: {
                        code: ERROR_CODES.NOT_FRIEND,
                        message: "친구가 아닌 사용자는 조회할 수 없습니다. "
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
