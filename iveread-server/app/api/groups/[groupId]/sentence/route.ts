import { NextResponse } from "next/server";
import { createSentence } from "@/services/sentence.service";
import { CreateSentenceDto, UpdateSentenceDto, SentenceResponseDto } from "@/types/sentence";
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
    const body = await request.json() as CreateSentenceDto;

    if (!body.content || !body.bookIsbn) {
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

    const newSentence = await createSentence(userId, groupId, body);
    
    return NextResponse.json<ApiResponse<SentenceResponseDto>>(
        { success: true, 
            data: newSentence
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
