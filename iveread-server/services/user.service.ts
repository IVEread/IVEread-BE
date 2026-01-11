import { db } from "@/lib/db";
import { UserProfileResponseDto } from "@/types/user"
import { ERROR_CODES } from "@/app/constants/errorCodes"

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