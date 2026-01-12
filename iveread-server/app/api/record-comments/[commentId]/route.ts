import { NextResponse } from "next/server";
import { deleteRecordComment, updateRecordComment } from "@/services/recordComment.service";
import { UpdateRecordCommentDto, RecordCommentResponseDto } from "@/types/recordComment";
import { ApiResponse } from "@/types/response";
import { ERROR_CODES } from "@/app/constants/errorCodes";

export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ commentId: string }> }
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

        const { commentId } = await params;
        const body = await request.json() as UpdateRecordCommentDto;

        if (!body.content) {
            return NextResponse.json(
                {
                    success: false,
                    error: {
                        code: ERROR_CODES.INVALID_REQUEST,
                        message: "No content to update."
                    }
                },
                { status: 400 }
            );
        }

        const updated = await updateRecordComment(userId, commentId, body);

        return NextResponse.json<ApiResponse<RecordCommentResponseDto>>({
            success: true,
            data: updated
        });
    } catch (error: any) {
        console.error("Record comment update failed:", error);

        if (error.message === ERROR_CODES.COMMENT_NOT_FOUND) {
            return NextResponse.json(
                {
                    success: false,
                    error: {
                        code: ERROR_CODES.COMMENT_NOT_FOUND,
                        message: "Comment not found."
                    }
                },
                { status: 404 }
            );
        } else if (error.message === ERROR_CODES.NOT_COMMENT_OWNER) {
            return NextResponse.json(
                {
                    success: false,
                    error: {
                        code: ERROR_CODES.NOT_COMMENT_OWNER,
                        message: "Not comment owner."
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

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ commentId: string }> }
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

        const { commentId } = await params;
        await deleteRecordComment(userId, commentId);

        return NextResponse.json<ApiResponse<null>>({
            success: true,
            data: null,
            message: "Comment deleted."
        });
    } catch (error: any) {
        console.error("Record comment delete failed:", error);

        if (error.message === ERROR_CODES.COMMENT_NOT_FOUND) {
            return NextResponse.json(
                {
                    success: false,
                    error: {
                        code: ERROR_CODES.COMMENT_NOT_FOUND,
                        message: "Comment not found."
                    }
                },
                { status: 404 }
            );
        } else if (error.message === ERROR_CODES.NOT_COMMENT_OWNER) {
            return NextResponse.json(
                {
                    success: false,
                    error: {
                        code: ERROR_CODES.NOT_COMMENT_OWNER,
                        message: "Not comment owner."
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
