import { db } from "@/lib/db";
import { CreateSentenceDto, UpdateSentenceDto, SentenceResponseDto } from "@/types/sentence";
import { ERROR_CODES } from "@/app/constants/errorCodes";

export const createSentence = async (userId: string, groupId: string, data: CreateSentenceDto): Promise<SentenceResponseDto> => {
    const newSentence = await db.sentence.create({
        data: {
            content: data.content,
            pageNo: data.pageNo,
            thought: data.thought,
            user: { connect: { id: userId } },
            group: { connect: { id: groupId }},
            book: { connect: { isbn: data.bookIsbn } }
        },
        include: {
            user: true,
            book: true,
        }
    });

    return {
        id: newSentence.id,
        content: newSentence.content,
        pageNo: newSentence.pageNo,
        thought: newSentence.thought,
        createdAt: newSentence.createdAt,
        userId: newSentence.user.id,
        userNickname: newSentence.user.nickname,
        userProfileEmoji: newSentence.user.emoji,
        bookIsbn: newSentence.book.isbn,
        bookTitle: newSentence.book.title,
        bookCoverImage: newSentence.book.coverImage,
    }
}

export const getSentences = async (groupId: string): Promise<SentenceResponseDto[]> => {
    
    const sentences = await db.sentence.findMany({
        orderBy: { createdAt: 'desc' },
        where: { groupId: groupId },
                include: {
            user: true,
            book: true,
        }
    });

    return sentences.map(sentence => ({
        id: sentence.id,
        content: sentence.content,
        pageNo: sentence.pageNo,
        thought: sentence.thought,
        createdAt: sentence.createdAt,
        userId: sentence.user.id,
        userNickname: sentence.user.nickname,
        userProfileEmoji: sentence.user.emoji,
        bookIsbn: sentence.book.isbn,
        bookTitle: sentence.book.title,
        bookCoverImage: sentence.book.coverImage,
    }));
}