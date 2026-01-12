import { NextResponse } from "next/server";
import { deleteSentence, updateSentence } from "@/services/sentence.service";
import { UpdateSentenceDto, SentenceResponseDto } from "@/types/sentence";
import { ApiResponse } from "@/types/response";
import { ERROR_CODES } from "@/app/constants/errorCodes"

export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ sentenceId: string }> }
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
        const body = await request.json() as UpdateSentenceDto;

        if (!body.content && !body.pageNo && !body.thought) {
            return NextResponse.json(
                {
                    success: false,
                    error: {
                        code: ERROR_CODES.INVALID_REQUEST,
                        message: "변경할 내용이 없습니다. "
                    }
                },
                { status: 400 } // Bad Request
            );
        }

        const updatedSentence = await updateSentence(userId, sentenceId, body);

        return NextResponse.json<ApiResponse<SentenceResponseDto>>({
            success: true,
            data: updatedSentence
        });
    } catch (error: any) {
        console.error("문장 수정 실패: ", error);

        if (error.message === ERROR_CODES.SENTENCE_NOT_FOUND) {
            return NextResponse.json(
                { 
                    success: false, 
                    error: { 
                        code: ERROR_CODES.SENTENCE_NOT_FOUND, 
                        message: "문장을 찾을 수 없습니다." } 
                    },
                { status: 404 } // Not Found
            );
        } else if (error.message === ERROR_CODES.NOT_SENTENCE_OWNER) {
            return NextResponse.json(
                { 
                    success: false, 
                    error: { 
                        code: ERROR_CODES.NOT_SENTENCE_OWNER, 
                        message: "본인의 문장만 수정할 수 있습니다. " } 
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
    { params }: { params: Promise<{ sentenceId: string }> }
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
        await deleteSentence(userId, sentenceId);

        return NextResponse.json<ApiResponse<null>>({
            success: true,
            data: null,
            message: "문장이 삭제되었습니다. "
        });
    } catch (error: any) {
        console.error("문장 삭제 실패: ", error);

        if (error.message === ERROR_CODES.SENTENCE_NOT_FOUND) {
            return NextResponse.json(
                { 
                    success: false, 
                    error: { 
                        code: ERROR_CODES.SENTENCE_NOT_FOUND, 
                        message: "문장을 찾을 수 없습니다." } 
                    },
                { status: 404 } // Not Found
            );
        } else if (error.message === ERROR_CODES.NOT_SENTENCE_OWNER) {
            return NextResponse.json(
                { 
                    success: false, 
                    error: { 
                        code: ERROR_CODES.NOT_SENTENCE_OWNER, 
                        message: "본인의 문장만 삭제할 수 있습니다. " } 
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

