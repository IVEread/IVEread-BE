import { ERROR_CODES } from "@/app/constants/errorCodes";
import { ApiResponse } from "@/types/response";
import { NextResponse } from "next/server"

export async function POST () {
    try {
        return NextResponse.json<ApiResponse<null>>(
            { success: true, 
                message: "로그아웃되었습니다. ",
                data: null
            },
            { status: 200 } // OK
        );
    
    } catch (error: any) {
        console.error("로그아웃 에러: ", error);

        return NextResponse.json(
            { success: false, 
                error: {
                    code: ERROR_CODES.INTERNAL_SERVER_ERROR,
                    message: '서버 내부에 오류가 발생했습니다. '
                }
            },
            { status: 500 } // Internal Server Error
        );
    }
}