import { NextResponse } from "next/server"
import { loginUser } from "@/services/auth.service"
import { LoginUserDto } from "@/types/user"
import { ERROR_CODES } from "@/app/constants/errorCodes"

export async function POST(request: Request) {
    try {
        const body = await request.json() as LoginUserDto;

        if (!body.email || !body.password) {
            return NextResponse.json(
                { error: '필수 입력값이 누락되었습니다. '},
                { status: 400 }// Bad Request
            );
        }

        const user = await loginUser(body);
        return NextResponse.json(user, { status: 200 }); // OK

    } catch (error: any) {
        console.error("로그인 에러:", error);

        if (error.message === ERROR_CODES.USER_NOT_FOUND || error.message === ERROR_CODES.PASSWORD_MISMATCH) {
            return NextResponse.json(
                { error: '이메일 또는 비밀번호가 올바르지 않습니다.' },
                { status: 401 } // Unauthorized
            );
        }

        return NextResponse.json(
            { error: '서버 내부에 오류가 발생했습니다. '},
            { status: 500 } // Internal Server Error
        );
    }
}