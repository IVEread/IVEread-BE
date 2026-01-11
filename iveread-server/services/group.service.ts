import { db } from "@/lib/db";
import { CreateGroupDto, GroupResponseDto } from "@/types/group";
import { ERROR_CODES } from "@/app/constants/errorCodes";
import bcrypt from "bcrypt";

export const createGroup = async (userId: string, data: CreateGroupDto) => {
    const newGroup = await db.group.create({
        data: {
            name: data.name,
            startDate: new Date(data.startDate),
            goalDate: new Date(data.goalDate),
        
            book: {
                connectOrCreate: {
                    where: { isbn: data.book.isbn },
                    create: {
                        isbn: data.book.isbn,
                        title: data.book.title,
                        author: data.book.author,
                        publisher: data.book.publisher,
                        coverImage: data.book.coverImage,
                        totalPage: data.book.totalPage,
                    },
                },
            },

            members: {
                create: {
                    userId: userId,
                },
            },
        },
        include: {
            book: true,
        }
    });

    return {
        id: newGroup.id,
        name: newGroup.name,
        startDate: newGroup.startDate,
        goalDate: newGroup.goalDate,
        bookTitle: newGroup.book.title,
        bookCover: newGroup.book.coverImage,
        memberCount: 1,
        createdAt: newGroup.createdAt,
    };
};

export const getGroups = async (userId: string): Promise<GroupResponseDto[]> => {
    
    const groups = await db.group.findMany({
        orderBy: { createdAt: 'desc'},
        where: {
            members: {
                some: {
                    userId: userId,
                }
            }
        },
        include: {
            book: true,
            _count: {
                select: {members: true}
            }
        }
    });

    return groups.map(group => ({
        id: group.id,
        name: group.name,
        startDate: group.startDate,
        goalDate: group.goalDate,
        bookTitle: group.book.title,
        bookCover: group.book.coverImage,
        memberCount: group._count.members,
        createdAt: group.createdAt,
    }));
}