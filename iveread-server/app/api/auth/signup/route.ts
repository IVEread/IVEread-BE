import { NextResponse, NextRequest } from "next/server"
import { signupUser } from "@/services/auth.service"
import { CreateUserDto } from "@/types/user"
import { ERROR_CODES } from "@/app/constants/errorCodes"

export async function POST(request: Request) {
    try {
        const body = await request.json() as CreateUserDto;
        
        if (!body.email || !body.password || !body.nickname) {
            return NextResponse.json(
                { error: '필수 입력값이 누락되었습니다. '},
                { status: 400 } // Bad Request
            );
        }

        const newUser = await signupUser(body);
        return NextResponse.json(newUser, { status: 201 });

    } catch(error: any) {
        console.error("회원가입 에러: ", error);

        if (error.message === ERROR_CODES.EMAIL_EXIST) {
            return NextResponse.json(
                { error: '이미 가입된 이메일입니다.' },
                { status: 409 } // Conflict
            )
        }

        return NextResponse.json(
            { error: '서버 내부에 오류가 발생했습니다. '},
            { status: 500 } // Internal Server Error
        )

    }

}