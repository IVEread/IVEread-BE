import { NextResponse } from "next/server";
import { deleteRecordReaction, updateRecordReaction } from "@/services/recordReaction.service";
import { UpdateRecordReactionDto, RecordReactionResponseDto } from "@/types/recordReaction";
import { ApiResponse } from "@/types/response";
import { ERROR_CODES } from "@/app/constants/errorCodes";

export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ reactionId: string }> }
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

        const { reactionId } = await params;
        const body = await request.json() as UpdateRecordReactionDto;

        if (!body.emoji) {
            return NextResponse.json(
                {
                    success: false,
                    error: {
                        code: ERROR_CODES.INVALID_REQUEST,
                        message: "No emoji to update."
                    }
                },
                { status: 400 }
            );
        }

        const updated = await updateRecordReaction(userId, reactionId, body);

        return NextResponse.json<ApiResponse<RecordReactionResponseDto>>({
            success: true,
            data: updated
        });
    } catch (error: any) {
        console.error("Record reaction update failed:", error);

        if (error.message === ERROR_CODES.REACTION_NOT_FOUND) {
            return NextResponse.json(
                {
                    success: false,
                    error: {
                        code: ERROR_CODES.REACTION_NOT_FOUND,
                        message: "Reaction not found."
                    }
                },
                { status: 404 }
            );
        } else if (error.message === ERROR_CODES.NOT_REACTION_OWNER) {
            return NextResponse.json(
                {
                    success: false,
                    error: {
                        code: ERROR_CODES.NOT_REACTION_OWNER,
                        message: "Not reaction owner."
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

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ reactionId: string }> }
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

        const { reactionId } = await params;
        await deleteRecordReaction(userId, reactionId);

        return NextResponse.json<ApiResponse<null>>({
            success: true,
            data: null,
            message: "Reaction deleted."
        });
    } catch (error: any) {
        console.error("Record reaction delete failed:", error);

        if (error.message === ERROR_CODES.REACTION_NOT_FOUND) {
            return NextResponse.json(
                {
                    success: false,
                    error: {
                        code: ERROR_CODES.REACTION_NOT_FOUND,
                        message: "Reaction not found."
                    }
                },
                { status: 404 }
            );
        } else if (error.message === ERROR_CODES.NOT_REACTION_OWNER) {
            return NextResponse.json(
                {
                    success: false,
                    error: {
                        code: ERROR_CODES.NOT_REACTION_OWNER,
                        message: "Not reaction owner."
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
