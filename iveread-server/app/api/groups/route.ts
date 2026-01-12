import { NextResponse } from "next/server";
import { createGroup, getGroups } from "@/services/group.service";
import { CreateGroupDto, GroupResponseDto } from "@/types/group";
import { ApiResponse } from "@/types/response";
import { ERROR_CODES } from "@/app/constants/errorCodes"

export async function GET(request: Request) {
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

    const groups = await getGroups(userId);
    return NextResponse.json<ApiResponse<any>>(
        {
            success: true,
            data: groups
        },
        { status: 200 } // Ok
    );

  } catch (error) {
    console.error("그룹 목록 조회 실패:", error);
    
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

export async function POST(request: Request) {
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

    const body = await request.json() as CreateGroupDto;

    if (!body.name || !body.book?.isbn) {
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

    const newGroup = await createGroup(userId, body);
        return NextResponse.json<ApiResponse<GroupResponseDto>>(
            { success: true, 
                data: newGroup
            }, 
            { status: 201 } // Created
        );

  } catch (error) {
    console.error("그룹 생성 실패:", error);
    
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
