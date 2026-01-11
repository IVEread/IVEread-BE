import { NextResponse } from "next/server";
import { getGroup } from "@/services/group.service";
import { GroupResponseDto } from "@/types/group";
import { ApiResponse } from "@/types/response";
import { ERROR_CODES } from "@/app/constants/errorCodes"

export async function GET(
    request: Request,
    { params }: { params: Promise<{ groupId: string }> }
) {
  try {
    const { groupId } = await params;
    const group = await getGroup(groupId);
    return NextResponse.json<ApiResponse<GroupResponseDto>>(
        {
            success: true,
            data: group
        },
        { status: 200 } // Ok
    );

  } catch (error: any) {
    console.error("그룹 조회 실패: ", error);

        if (error.message === ERROR_CODES.GROUP_NOT_FOUND) {
            return NextResponse.json(
                {
                    success: false,
                    error: {
                        code: ERROR_CODES.GROUP_NOT_FOUND,
                        message: "그룹을 찾을 수 없습니다. "
                    },
                },
                { status: 404 } // Not Found
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
        )
  }
}