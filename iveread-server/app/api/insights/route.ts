import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { ERROR_CODES } from "@/app/constants/errorCodes";
import {
    buildWeekdayDistribution,
    calculateBestStreak,
    calculateCurrentStreak,
    calculateWeeklyFrequency,
    dateToKey,
    daysBetweenUTC
} from "@/lib/insights-helpers";
import type { WeekdayDistribution } from "@/lib/insights-helpers";

type InsightsResponse = {
    habit: {
        totalReadingDays: number;
        currentStreak: number;
        bestStreak: number;
        weeklyFrequency: number;
        weekdayDistribution: WeekdayDistribution;
    };
    completion: {
        finishedBooks: number;
        activeGroups: number;
        completionRate: number;
        avgFinishDays: number | null;
    };
    activity: {
        totalRecords: number;
        totalSentences: number;
        topBooks: { isbn: string; title: string; recordCount: number }[];
    };
};

const CACHE_TTL_MS = 24 * 60 * 60 * 1000;
const insightsCache = new Map<string, { expiresAt: number; data: InsightsResponse }>();

export async function GET(request: Request) {
    try {
        const userId = request.headers.get("x-user-id");
        if (!userId) {
            return NextResponse.json(
                {
                    success: false,
                    error: {
                        code: ERROR_CODES.UNAUTHORIZED,
                        message: "로그인이 필요합니다. "
                    }
                },
                { status: 401 }
            );
        }

        const cacheKey = `insight:${userId}`;
        const cached = insightsCache.get(cacheKey);
        if (cached && cached.expiresAt > Date.now()) {
            return NextResponse.json(cached.data);
        }

        const [
            attendanceRecords,
            finishedBooks,
            activeGroups,
            completionMembers,
            totalRecords,
            totalSentences,
            topBookGroups
        ] = await Promise.all([
            db.attendance.findMany({
                where: { userId },
                select: { date: true }
            }),
            db.groupMember.count({
                where: { userId, isFinished: true }
            }),
            db.groupMember.count({
                where: { userId, isFinished: false }
            }),
            db.groupMember.findMany({
                where: { userId, isFinished: true, finishedAt: { not: null } },
                select: {
                    finishedAt: true,
                    group: { select: { startDate: true } }
                }
            }),
            db.readingRecord.count({
                where: { userId }
            }),
            db.sentence.count({
                where: { userId }
            }),
            db.readingRecord.groupBy({
                by: ["bookIsbn"],
                where: { userId },
                _count: { _all: true },
                orderBy: { _count: { bookIsbn: "desc" } },
                take: 3
            })
        ]);

        const attendanceDates = attendanceRecords.map((record) => record.date);
        const uniqueDateKeys = new Set(attendanceDates.map(dateToKey));

        const totalReadingDays = uniqueDateKeys.size;
        const currentStreak = calculateCurrentStreak(uniqueDateKeys);
        const bestStreak = calculateBestStreak(uniqueDateKeys);
        const weeklyFrequency = calculateWeeklyFrequency(uniqueDateKeys);
        const weekdayDistribution = buildWeekdayDistribution(attendanceDates);

        let avgFinishDays: number | null = null;
        if (completionMembers.length > 0) {
            const totalDays = completionMembers.reduce((sum, member) => {
                if (!member.finishedAt) return sum;
                return sum + daysBetweenUTC(member.group.startDate, member.finishedAt);
            }, 0);
            avgFinishDays = totalDays / completionMembers.length;
        }

        const completionRate =
            finishedBooks + activeGroups === 0
                ? 0
                : finishedBooks / (finishedBooks + activeGroups);

        const topIsbns = topBookGroups.map((group) => group.bookIsbn);
        const topBooksData = topIsbns.length
            ? await db.book.findMany({
                  where: { isbn: { in: topIsbns } },
                  select: { isbn: true, title: true }
              })
            : [];

        const titleByIsbn = new Map(topBooksData.map((book) => [book.isbn, book.title]));
        const topBooks = topBookGroups.map((group) => ({
            isbn: group.bookIsbn,
            title: titleByIsbn.get(group.bookIsbn) ?? "",
            recordCount: group._count._all
        }));

        const insights: InsightsResponse = {
            habit: {
                totalReadingDays,
                currentStreak,
                bestStreak,
                weeklyFrequency,
                weekdayDistribution
            },
            completion: {
                finishedBooks,
                activeGroups,
                completionRate,
                avgFinishDays
            },
            activity: {
                totalRecords,
                totalSentences,
                topBooks
            }
        };

        insightsCache.set(cacheKey, {
            expiresAt: Date.now() + CACHE_TTL_MS,
            data: insights
        });

        return NextResponse.json(insights);
    } catch (error) {
        console.error("인사이트 조회 실패: ", error);
        return NextResponse.json(
            {
                success: false,
                error: {
                    code: ERROR_CODES.INTERNAL_SERVER_ERROR,
                    message: "서버 내부에 오류가 발생했습니다."
                }
            },
            { status: 500 }
        );
    }
}
