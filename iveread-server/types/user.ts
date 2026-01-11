export interface CreateUserDto {
    email: string;
    password: string;
    nickname: string;
}

export interface LoginUserDto {
    email: string;
    password: string;
}

export interface UserResponseDto {
    id: string;
    email: string;
    nickname: string;
}