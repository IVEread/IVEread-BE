import { NextResponse } from "next/server";
import { deleteComment, updateComment } from "@/services/comment.service";
import { UpdateCommentDto, CommentResponseDto } from "@/types/comment";
import { ApiResponse } from "@/types/response";
import { ERROR_CODES } from "@/app/constants/errorCodes"

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
                        message: "로그인이 필요합니다. "
                    }
                },
                { status: 401 } // Unauthorized
            )
        }

        const { commentId } = await params;
        const body = await request.json() as UpdateCommentDto;

        if (!body.content) {
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

        const updatedComment = await updateComment(userId, commentId, body);

        return NextResponse.json<ApiResponse<CommentResponseDto>>({
            success: true,
            data: updatedComment
        });
    } catch (error: any) {
        console.error("댓글 수정 실패: ", error);

        if (error.message === ERROR_CODES.COMMENT_NOT_FOUND) {
            return NextResponse.json(
                { 
                    success: false, 
                    error: { 
                        code: ERROR_CODES.COMMENT_NOT_FOUND, 
                        message: "댓글을 찾을 수 없습니다." } 
                    },
                { status: 404 } // Not Found
            );
        } else if (error.message === ERROR_CODES.NOT_COMMENT_OWNER) {
            return NextResponse.json(
                { 
                    success: false, 
                    error: { 
                        code: ERROR_CODES.NOT_COMMENT_OWNER, 
                        message: "본인의 댓글만 수정할 수 있습니다. " } 
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
                        message: "로그인이 필요합니다. "
                    }
                },
                { status: 401 } // Unauthorized
            )
        }

        const { commentId } = await params;
        await deleteComment(userId, commentId);

        return NextResponse.json<ApiResponse<null>>({
            success: true,
            data: null,
            message: "댓글이 삭제되었습니다. "
        });
    } catch (error: any) {
        console.error("댓글 삭제 실패: ", error);

        if (error.message === ERROR_CODES.COMMENT_NOT_FOUND) {
            return NextResponse.json(
                { 
                    success: false, 
                    error: { 
                        code: ERROR_CODES.COMMENT_NOT_FOUND, 
                        message: "댓글을 찾을 수 없습니다." } 
                    },
                { status: 404 } // Not Found
            );
        } else if (error.message === ERROR_CODES.NOT_COMMENT_OWNER) {
            return NextResponse.json(
                { 
                    success: false, 
                    error: { 
                        code: ERROR_CODES.NOT_COMMENT_OWNER, 
                        message: "본인의 댓글만 삭제할 수 있습니다. " } 
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

