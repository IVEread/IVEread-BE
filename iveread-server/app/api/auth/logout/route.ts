import { NextResponse } from "next/server"

export async function POST () {
    try {
        return NextResponse.json(
            { message: "로그아웃 되었습니다. "},
            { status: 200 } // OK
        );
    
    } catch (error: any) {
        console.error("로그아웃 에러: ,", error);

        return NextResponse.json(
            { error: '서버 내부에 오류가 발생했습니다. '},
            { status: 500 } // Internal Server Error
        );
    }
}