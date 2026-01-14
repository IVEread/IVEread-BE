import { NextResponse } from "next/server";
import path from "path";
import { writeFile, mkdir } from "fs/promises";
import { existsSync } from "fs";
import { ERROR_CODES } from "@/app/constants/errorCodes";

export async function POST(request: Request) {
    try {
        const formData = await request.formData();
        const file = formData.get("image") as File;

        if (!(file instanceof File)) {
            return NextResponse.json(
                {
                    success: false,
                    error: {
                        code: ERROR_CODES.MISSING_FIELDS,
                        message: "이미지 파일이 필요합니다."
                    }
                },
                { status: 400 } // Bad Request
            );
        }

        if (!file.type.startsWith("image/")) {
            return NextResponse.json(
                {
                    success: false,
                    error: {
                        code: ERROR_CODES.INVALID_FILE_TYPE,
                        message: "이미지 파일만 업로드 가능합니다."
                    }
                },
                { status: 400 } // Bad Request
            );
        }
        
        if (file.size > 10 * 1024 * 1024) { // 10MB
            return NextResponse.json(
                {
                    success: false,
                    error: {
                        code: ERROR_CODES.FILE_TOO_LARGE,
                        message: "파일 크기는 10MB를 초과할 수 없습니다."
                    }
                },
                { status: 400 } // Bad Request
            );
        }

        const buffer = Buffer.from(await file.arrayBuffer());

        const uploadsDir = path.join(process.cwd(), "public/uploads");
        if (!existsSync(uploadsDir)) {
            await mkdir(uploadsDir, { recursive: true });
        }
        
        const fileName = `${Date.now()}-${file.name.replaceAll(" ", "_")}`;
        const filePath = path.join(uploadsDir, fileName);

        await writeFile(filePath, buffer);
        const fileUrl = new URL(`/uploads/${fileName}`, request.url).toString();

        return NextResponse.json(
            {
                success: true,
                data: {
                    url: fileUrl
                }
            },
            { status: 201 } // Created
        );

    } catch (error: any) {
        console.log("이미지 업로드 실패: ", error);

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
