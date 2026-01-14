import { NextResponse } from "next/server";
import { ERROR_CODES } from "@/app/constants/errorCodes";

type InsightsPayload = {
    habit: {
        totalReadingDays: number;
        currentStreak: number;
        bestStreak: number;
        weeklyFrequency: number;
        weekdayDistribution: {
            mon: number;
            tue: number;
            wed: number;
            thu: number;
            fri: number;
            sat: number;
            sun: number;
        };
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

type GeminiResponse = {
    candidates?: Array<{
        content?: {
            parts?: Array<{ text?: string }>;
        };
    }>;
};

const CACHE_TTL_MS = 24 * 60 * 60 * 1000;
const summaryCache = new Map<string, { expiresAt: number; summary: string }>();

function buildPrompt(payload: InsightsPayload): string {
    return [
        "You are an assistant that writes short, natural Korean reading insight summaries",
        "for a mobile reading app.",
        "",
        "Input is structured numeric reading insight data (JSON).",
        "There are NO page-based metrics.",
        "",
        "Rules:",
        "- Write ONLY in Korean.",
        "- Do NOT mention pages or page counts.",
        "- Do NOT invent data that is not present.",
        "- Do NOT explain the data structure.",
        "- Do NOT use emojis or markdown.",
        "- Keep a warm, calm, reflective tone.",
        "- Output 4–6 sentences total.",
        "",
        "Content guidance:",
        "- Start with a brief overall summary (1 sentence).",
        "- Include at least one habit-related insight.",
        "- Include one completion or activity-related insight.",
        "- End with a gentle encouragement or reflection.",
        "",
        "Return only the final Korean text.",
        "Input JSON:",
        JSON.stringify(payload)
    ].join("\n");
}

function extractSummary(response: GeminiResponse): string {
    const text = response.candidates?.[0]?.content?.parts?.[0]?.text;
    return text?.trim() ?? "";
}

function isValidInsightsPayload(payload: InsightsPayload): boolean {
    if (!payload || typeof payload !== "object") return false;
    if (!payload.habit || !payload.completion || !payload.activity) return false;
    if (typeof payload.habit.currentStreak !== "number") return false;
    if (typeof payload.completion.completionRate !== "number") return false;
    return true;
}

export async function POST(request: Request) {
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

        const { searchParams } = new URL(request.url);
        const refreshQuery = searchParams.get("refresh");
        const refreshHeader = request.headers.get("x-refresh-ai");
        const isRefreshRequested =
            refreshQuery === "true" ||
            refreshQuery === "1" ||
            refreshHeader === "true" ||
            refreshHeader === "1";

        const cacheKey = `ai-insight:${userId}`;
        const cached = summaryCache.get(cacheKey);
        if (!isRefreshRequested && cached && cached.expiresAt > Date.now()) {
            return NextResponse.json({ summary: cached.summary });
        }

        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
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

        const payload = (await request.json()) as InsightsPayload;
        if (!isValidInsightsPayload(payload)) {
            return NextResponse.json(
                {
                    success: false,
                    error: {
                        code: ERROR_CODES.INVALID_REQUEST,
                        message: "Invalid payload."
                    }
                },
                { status: 400 }
            );
        }
        const prompt = buildPrompt(payload);

        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    contents: [
                        {
                            role: "user",
                            parts: [{ text: prompt }]
                        }
                    ],
                    generationConfig: {
                        temperature: 0.6,
                        maxOutputTokens: 512
                    }
                })
            }
        );

        if (!response.ok) {
            const errorText = await response.text();
            console.error("Gemini 호출 실패:", response.status, errorText);
            return NextResponse.json(
                {
                    success: false,
                    error: {
                        code: ERROR_CODES.INTERNAL_SERVER_ERROR,
                        message: "서버 내부에 오류가 발생했습니다."
                    }
                },
                { status: 502 }
            );
        }

        const data = (await response.json()) as GeminiResponse;
        const summary = extractSummary(data);

        if (!summary) {
            console.error("Gemini 응답 파싱 실패:", data);
            return NextResponse.json(
                {
                    success: false,
                    error: {
                        code: ERROR_CODES.INTERNAL_SERVER_ERROR,
                        message: "서버 내부에 오류가 발생했습니다."
                    }
                },
                { status: 502 }
            );
        }

        summaryCache.set(cacheKey, {
            expiresAt: Date.now() + CACHE_TTL_MS,
            summary
        });

        return NextResponse.json({ summary });
    } catch (error) {
        console.error("AI 요약 생성 실패:", error);
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
