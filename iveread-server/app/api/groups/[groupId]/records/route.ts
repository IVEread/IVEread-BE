import { NextResponse } from "next/server";
import { createRecord, getRecords } from "@/services/record.service";
import { CreateRecordDto, RecordResponseDto } from "@/types/record";
import { ApiResponse } from "@/types/response";
import { ERROR_CODES } from "@/app/constants/errorCodes"

export async function POST(
    request: Request,
    { params }: {params: Promise<{ groupId: string }>}
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

    const { groupId } = await params;
    const body = await request.json() as CreateRecordDto;

    if (!body.readDate || !body.imageUrl || !body.startPage || !body.endPage || !body.bookIsbn) {
        return NextResponse.json(
            { success: false, 
                error: {
                    code: ERROR_CODES.MISSING_FIELDS,
                    message: '필수 입력값이 누락되었습니다. '
                }
            },
            { status: 400 } // Bad Request
        );
    }

    const newRecord = await createRecord(userId, groupId, body);

    return NextResponse.json<ApiResponse<RecordResponseDto>>(
        { success: true, 
            data: newRecord
        }, 
        { status: 201 } // Created
    );

  } catch (error) {
    console.error("독서 기록 실패:", error);
    
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

export async function GET(
    request: Request,
    { params }: {params: Promise<{ groupId: string }> }
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

    const { groupId } = await params;
    const records = await getRecords(groupId);

    return NextResponse.json<ApiResponse<any>>(
        {
            success: true,
            data: records
        },
        { status: 200 } // Ok
    );

  } catch (error) {
    console.error("독서 기록 조회 실패:", error);
    
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