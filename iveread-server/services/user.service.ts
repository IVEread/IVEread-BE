import { db } from "@/lib/db";
import { UpdateUserDto, UserProfileResponseDto } from "@/types/user"
import { ERROR_CODES } from "@/app/constants/errorCodes"
import { ApiResponse } from "@/types/response";

export const getUserProfile = async (userId: string): Promise<UserProfileResponseDto> => {
    const user = await db.user.findUnique({
        where: { id: userId },
    });

    if (!user) {
        throw new Error(ERROR_CODES.USER_NOT_FOUND);
    }

    return {
        id: user.id,
        email: user.email,
        nickname: user.nickname,
        emoji: user.emoji,
    };
}

export const updateUserProfile = async (userId: string, data: UpdateUserDto): Promise<UserProfileResponseDto> => {
    try {
        const updatedUser = await db.user.update({
            where: { id: userId },
            data: {
                ...(data.nickname && { nickname: data.nickname }),
                ...(data.emoji && { emoji: data.emoji }),
            },
        });

        return {
            id: updatedUser.id,
            email: updatedUser.email,
            nickname: updatedUser.nickname,
            emoji: updatedUser.emoji,
        };
        
    } catch (error: any) {
        if (error.code === 'P2025') {
            throw new Error(ERROR_CODES.USER_NOT_FOUND);
        }
        throw error;
    }
}