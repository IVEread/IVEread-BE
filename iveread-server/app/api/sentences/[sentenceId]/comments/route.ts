import { NextResponse } from "next/server";
import { createComment, getComments } from "@/services/comment.service";
import { CreateCommentDto, UpdateCommentDto, CommentResponseDto } from "@/types/comment";
import { ApiResponse } from "@/types/response";
import { ERROR_CODES } from "@/app/constants/errorCodes"

export async function POST(
    request: Request,
    { params }: {params: Promise<{ sentenceId: string }>}
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

    const { sentenceId } = await params;
    const body = await request.json() as CreateCommentDto;

    if (!body.content) {
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

    const newComment = await createComment(userId, sentenceId, body);

    return NextResponse.json<ApiResponse<CommentResponseDto>>(
        { success: true, 
            data: newComment
        }, 
        { status: 201 } // Created
    );

  } catch (error) {
    console.error("문장 기록 실패:", error);
    
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
    { params }: {params: Promise<{ sentenceId: string }> }
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

    const { sentenceId } = await params;
    const comments = await getComments(sentenceId);

    return NextResponse.json<ApiResponse<any>>(
        {
            success: true,
            data: comments
        },
        { status: 200 } // Ok
    );

  } catch (error) {
    console.error("댓글 조회 실패:", error);
    
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