import { db } from "@/lib/db";
import { CreateUserDto } from "@/types/user"
import { ERROR_CODES } from "@/app/constants/errorCodes"
import bcrypt from "bcrypt";

export const signupUser = async (data: CreateUserDto) => {
    const { email, password, nickname } = data;

    const existingUser = await db.user.findUnique({
        where: { email },
    });

    if (existingUser) {
        throw new Error(ERROR_CODES.EMAIL_EXIST);
    }

    const hashedPassword = await bcrypt.hash(password, 10);

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