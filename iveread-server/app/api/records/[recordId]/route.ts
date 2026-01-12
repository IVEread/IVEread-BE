import { NextResponse } from "next/server";
import { deleteRecord, getRecordById, updateRecord } from "@/services/record.service";
import { UpdateRecordDto, RecordResponseDto } from "@/types/record";
import { ApiResponse } from "@/types/response";
import { ERROR_CODES } from "@/app/constants/errorCodes"

export async function PATCH(
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
            )
        }

        const { recordId } = await params;
        const body = await request.json() as UpdateRecordDto;

        if (!body.comment && !body.startPage && !body.endPage && !body.imageUrl) {
            return NextResponse.json(
                {
                    success: false,
                    error: {
                        code: ERROR_CODES.INVALID_REQUEST,
                        message: "변경할 내용이 없습니다. "
                    }
                },
                { status: 400 }
            );
        }

        const updatedRecord = await updateRecord(userId, recordId, body);

        return NextResponse.json<ApiResponse<RecordResponseDto>>({
            success: true,
            data: updatedRecord
        });
    } catch (error: any) {
        console.error("독서 기록 수정 실패: ", error);

        if (error.message === ERROR_CODES.RECORD_NOT_FOUND) {
            return NextResponse.json(
                { 
                    success: false, 
                    error: { 
                        code: ERROR_CODES.RECORD_NOT_FOUND, 
                        message: "독서 기록을 찾을 수 없습니다." } 
                    },
                { status: 404 } // Not Found
            );
        } else if (error.message === ERROR_CODES.NOT_RECORD_OWNER) {
            return NextResponse.json(
                { 
                    success: false, 
                    error: { 
                        code: ERROR_CODES.NOT_RECORD_OWNER, 
                        message: "본인의 독서 기록만 수정할 수 있습니다. " } 
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
        const record = await getRecordById(userId, recordId);

        return NextResponse.json<ApiResponse<RecordResponseDto>>({
            success: true,
            data: record
        });
    } catch (error: any) {
        console.error("독서 기록 조회 실패 ", error);

        if (error.message === ERROR_CODES.RECORD_NOT_FOUND) {
            return NextResponse.json(
                { 
                    success: false, 
                    error: { 
                        code: ERROR_CODES.RECORD_NOT_FOUND, 
                        message: "독서 기록을 찾을 수 없습니다. " } 
                    },
                { status: 404 }
            );
        } else if (error.message === ERROR_CODES.NOT_GROUP_MEMBER) {
            return NextResponse.json(
                { 
                    success: false, 
                    error: { 
                        code: ERROR_CODES.NOT_GROUP_MEMBER, 
                        message: "해당 그룹의 멤버가 아닙니다. " } 
                    },
                { status: 403 }
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

export async function DELETE(
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
            )
        }

        const { recordId } = await params;
        await deleteRecord(userId, recordId);

        return NextResponse.json<ApiResponse<null>>({
            success: true,
            data: null,
            message: "독서 기록이 삭제되었습니다. "
        });
    } catch (error: any) {
        console.error("독서 기록 삭제 실패: ", error);

        if (error.message === ERROR_CODES.RECORD_NOT_FOUND) {
            return NextResponse.json(
                { 
                    success: false, 
                    error: { 
                        code: ERROR_CODES.RECORD_NOT_FOUND, 
                        message: "독서 기록을 찾을 수 없습니다." } 
                    },
                { status: 404 } // Not Found
            );
        } else if (error.message === ERROR_CODES.NOT_RECORD_OWNER) {
            return NextResponse.json(
                { 
                    success: false, 
                    error: { 
                        code: ERROR_CODES.NOT_RECORD_OWNER, 
                        message: "본인의 독서 기록만 삭제할 수 있습니다. " } 
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

