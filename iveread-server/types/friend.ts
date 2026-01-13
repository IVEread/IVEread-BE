export interface FriendResponseDto {
    id: string;
    nickname: string;
    email: string;
    userProfileEmoji: string | null;
    followedAt?: Date;
}