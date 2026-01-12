import { NextResponse } from "next/server";
import { createRecordReaction, getRecordReactions } from "@/services/recordReaction.service";
import { CreateRecordReactionDto, RecordReactionResponseDto } from "@/types/recordReaction";
import { ApiResponse } from "@/types/response";
import { ERROR_CODES } from "@/app/constants/errorCodes";

export async function POST(
    request: Request,
    { params }: { params: Promise<{ recordId: string }> }
) {
    try {
        const userId = request.headers.get("x-user-id");

        if (!userId) {
            return NextResponse.json(
                {
                    success: false,
                    error: {
                        code: ERROR_CODES.UNAUTHORIZED,
                        message: "Authentication required."
                    }
                },
                { status: 401 }
            );
        }

        const { recordId } = await params;
        const body = await request.json() as CreateRecordReactionDto;

        if (!body.emoji) {
            return NextResponse.json(
                {
                    success: false,
                    error: {
                        code: ERROR_CODES.MISSING_FIELDS,
                        message: "Missing required fields."
                    }
                },
                { status: 400 }
            );
        }

        const newReaction = await createRecordReaction(userId, recordId, body);

        return NextResponse.json<ApiResponse<RecordReactionResponseDto>>(
            {
                success: true,
                data: newReaction
            },
            { status: 200 }
        );
    } catch (error: any) {
        console.error("Record reaction create failed:", error);

        if (error.message === ERROR_CODES.RECORD_NOT_FOUND) {
            return NextResponse.json(
                {
                    success: false,
                    error: {
                        code: ERROR_CODES.RECORD_NOT_FOUND,
                        message: "Record not found."
                    }
                },
                { status: 404 }
            );
        }

        if (error.message === ERROR_CODES.NOT_GROUP_MEMBER) {
            return NextResponse.json(
                {
                    success: false,
                    error: {
                        code: ERROR_CODES.NOT_GROUP_MEMBER,
                        message: "User is not a group member."
                    }
                },
                { status: 403 }
            );
        }

        return NextResponse.json(
            {
                success: false,
                error: {
                    code: ERROR_CODES.INTERNAL_SERVER_ERROR,
                    message: "Internal server error."
                }
            },
            { status: 500 }
        );
    }
}

export async function GET(
    request: Request,
    { params }: { params: Promise<{ recordId: string }> }
) {
    try {
        const userId = request.headers.get("x-user-id");

        if (!userId) {
            return NextResponse.json(
                {
                    success: false,
                    error: {
                        code: ERROR_CODES.UNAUTHORIZED,
                        message: "Authentication required."
                    }
                },
                { status: 401 }
            );
        }

        const { recordId } = await params;
        const reactions = await getRecordReactions(recordId);

        return NextResponse.json<ApiResponse<RecordReactionResponseDto[]>>(
            {
                success: true,
                data: reactions
            },
            { status: 200 }
        );
    } catch (error) {
        console.error("Record reaction lookup failed:", error);

        return NextResponse.json(
            {
                success: false,
                error: {
                    code: ERROR_CODES.INTERNAL_SERVER_ERROR,
                    message: "Internal server error."
                }
            },
            { status: 500 }
        );
    }
}
