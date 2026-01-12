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
                        message: "Authentication required."
                    }
                },
                { status: 401 }
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
                        message: "Missing required fields."
                    }
                },
                { status: 400 }
            );
        }

        const newComment = await createRecordComment(userId, recordId, body);

        return NextResponse.json<ApiResponse<RecordCommentResponseDto>>(
            {
                success: true,
                data: newComment
            },
            { status: 201 }
        );
    } catch (error: any) {
        console.error("Record comment create failed:", error);

        if (error.message === ERROR_CODES.RECORD_NOT_FOUND) {
            return NextResponse.json(
                {
                    success: false,
                    error: {
                        code: ERROR_CODES.RECORD_NOT_FOUND,
                        message: "Record not found."
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
                        message: "User is not a group member."
                    }
                },
                { status: 403 }
            );
        }

        return NextResponse.json(
            {
                success: false,
                error: {
                    code: ERROR_CODES.INTERNAL_SERVER_ERROR,
                    message: "Internal server error."
                }
            },
            { status: 500 }
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
                        message: "Authentication required."
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
        console.error("Record comment lookup failed:", error);

        return NextResponse.json(
            {
                success: false,
                error: {
                    code: ERROR_CODES.INTERNAL_SERVER_ERROR,
                    message: "Internal server error."
                }
            },
            { status: 500 }
        );
    }
}
