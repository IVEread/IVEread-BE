export interface FriendResponseDto {
    id: string;
    nickname: string;
    userProfileEmoji: string | null;
    followedAt?: Date;
}