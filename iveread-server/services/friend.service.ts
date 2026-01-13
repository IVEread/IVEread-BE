import { db } from "@/lib/db";
import { ERROR_CODES } from "@/app/constants/errorCodes";
import { FriendResponseDto } from "@/types/friend";

export const addFriend = async (myId: string, targetId: string) => {

    if (myId === targetId) {
        throw new Error(ERROR_CODES.CANNOT_FOLLOW_SELF);
    }

    const targetUser = await db.user.findUnique({
        where: { id: targetId }
    });

    if (!targetUser) {
        throw new Error(ERROR_CODES.USER_NOT_FOUND);
    }

    const existing = await db.friendship.findUnique({
        where: {
            followerId_followingId: {
                followerId: myId,
                followingId: targetId,
            },
        },
    });

    if (existing)
        return;

    return await db.friendship.create({
        data: {
            followerId: myId,
            followingId: targetId
        }
    });
}

export const removeFriend = async (myId: string, targetId: string) => {
    await db.friendship.deleteMany({
        where: {
            followerId: myId,
            followingId: targetId
        }
    });
}

export const getFriends = async (myId: string): Promise<FriendResponseDto[]> => {
    const friendships = await db.friendship.findMany({
        where: {
            followerId: myId
        },
        orderBy: {
            createdAt: 'desc'
        },
        include: { 
            following: true 
        }
    });

    return friendships.map(friend => ({
        id: friend.following.id,
        nickname: friend.following.nickname,
        email: friend.following.email,
        userProfileEmoji: friend.following.emoji,
        followedAt: friend.createdAt
    }));
}
