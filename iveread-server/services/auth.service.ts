import { db } from "@/lib/db";
import { CreateUserDto, LoginUserDto } from "@/types/user"
import { ERROR_CODES } from "@/app/constants/errorCodes"
import bcrypt from "bcrypt";
import { nextTick } from "process";

export const signupUser = async (data: CreateUserDto) => {
    const { email, password, nickname } = data;

    // Check whether the email is available
    const existingUser = await db.user.findUnique({
        where: { email },
    });

    if (existingUser) {
        throw new Error(ERROR_CODES.EMAIL_EXIST);
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user into DB
    const newUser = await db.user.create({
        data: {
            email: email,
            password: hashedPassword,
            nickname: nickname
        }
    });

    return {
        id: newUser.id,
        email: newUser.email,
        nickname: newUser.nickname,
    };
};

export const loginUser = async (data: LoginUserDto) => {
    const { email, password } = data;

    // Check whether the user exists
    const user = await db.user.findUnique({
        where: { email },
    });

    if (!user) {
        throw new Error(ERROR_CODES.USER_NOT_FOUND);
    }

    // Check whether if the password is valid
    const isValidPassword = await bcrypt.compare(password, user.password);

    if (!isValidPassword) {
        throw new Error(ERROR_CODES.PASSWORD_MISMATCH);
    }

    return {
        id: user.id,
        email: user.email,
        nickname: user.nickname
    };
};