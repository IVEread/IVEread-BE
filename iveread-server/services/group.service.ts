import { db } from "@/lib/db";
import { CreateGroupDto, GroupResponseDto, UpdateGroupDto } from "@/types/group";
import { ERROR_CODES } from "@/app/constants/errorCodes";
import { Group } from "@prisma/client";

export const createGroup = async (userId: string, data: CreateGroupDto): Promise<GroupResponseDto> => {
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

export const getGroup = async (groupId: string): Promise<GroupResponseDto> => {
    
    const group = await db.group.findUnique({
        where: { id: groupId },
        include: {
            book: true,
            _count: {
                select: {members: true}
            }
        }
    });

    if (!group) {
        throw new Error(ERROR_CODES.GROUP_NOT_FOUND);
    }

    return {
        id: group.id,
        name: group.name,
        startDate: group.startDate,
        goalDate: group.goalDate,
        bookTitle: group.book.title,
        bookCover: group.book.coverImage,
        memberCount: group._count.members,
        createdAt: group.createdAt,
    };
}

export const updateGroup = async (groupId: string, data: UpdateGroupDto): Promise<GroupResponseDto> => {
    try {
        const updatedGroup = await db.group.update({
            where: { id: groupId },
            data: {
                name: data.name,
                goalDate: data.goalDate ? new Date(data.goalDate) : undefined,
            },
            include: {
                book: true,
                _count: {
                select: { members: true }
                }
            }
        });

        return {
            id: updatedGroup.id,
            name: updatedGroup.name,
            startDate: updatedGroup.startDate,
            goalDate: updatedGroup.goalDate,
            bookTitle: updatedGroup.book.title,
            bookCover: updatedGroup.book.coverImage,
            memberCount: updatedGroup._count.members,
            createdAt: updatedGroup.createdAt,
        };

    } catch (error: any) {
        if (error.code === 'P2025') {
            throw new Error(ERROR_CODES.GROUP_NOT_FOUND);
        }
        throw error;
    }
}

export const leaveGroup = async (userId: string, groupId: string) => {
    await db.$transaction(async (tx) => {
        try {
            await tx.groupMember.delete({
                where: {
                    userId_groupId: {
                        userId: userId,
                        groupId: groupId,
                    },
                },
            });
        } catch (error: any) {
            if (error.code === 'P2025') {
                throw new Error(ERROR_CODES.NOT_MEMBER);
            }
            throw error;
        }

        const remainingMembers = await tx.groupMember.count({
            where: { groupId: groupId },
        });

        if (remainingMembers === 0) {
            await tx.group.delete({
                where: { id: groupId },
            });
            console.log(`[Notice] 멤버가 0명이 되어 그룹(${groupId})이 자동 삭제되었습니다. `);
        }
    });

}

export const joinGroup = async (userId: string, groupId: string) => {
    try {
        await db.groupMember.create({
            data: {
                userId: userId,
                groupId: groupId,
            }
        });
    } catch (error: any) {
        // P2002: Unique constraint failed
        if (error.code === 'P2002') {
            throw new Error(ERROR_CODES.ALREADY_JOINED);
        }

        // P2003: Foreign key constraint failed
        if (error.code === 'P2003') {
            throw new Error(ERROR_CODES.GROUP_NOT_FOUND);
        }

        throw error;
    }
}

export const finishGroupRead = async (userId: string, groupId: string) => {
    const member = await db.groupMember.findUnique({
        where: {
            userId_groupId: {
                userId: userId,
                groupId: groupId,
            }
        }
    });

    if (!member) {
        throw new Error(ERROR_CODES.NOT_GROUP_MEMBER);
    }

    if (member.isFinished) {
        return;
    }

    await db.groupMember.update({
        where: {
            userId_groupId: {
                userId: userId,
                groupId: groupId,
            }
        },
        data: {
            isFinished: true,
            finishedAt: new Date(),
        }
    });
}

export const getFinishedBooks = async (userId: string) => {
    const finishedBooks = await db.groupMember.findMany({
        where: { userId: userId, isFinished: true },
        orderBy: { group: { startDate: 'desc'} },
        include: {
            group: {
                include: {
                    book: true,
                }
            }
        },
    });

    return finishedBooks.map(finishedBook => ({
        id: finishedBook.group.id,
        groupId: finishedBook.group.id,
        bookIsbn: finishedBook.group.bookIsbn,
        bookTitle: finishedBook.group.book.title,
        bookAuthor: finishedBook.group.book.author,
        bookCoverImage: finishedBook.group.book.coverImage,
        finishedAt: finishedBook.finishedAt ?? new Date(),
    }));
};