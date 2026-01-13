import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
    dateToKey,
    calculateCurrentStreak,
    calculateBestStreak,
    calculateWeeklyFrequency
} from "../lib/insights-helpers";

function keyForUtc(year: number, month: number, day: number): string {
    return dateToKey(new Date(Date.UTC(year, month - 1, day)));
}

describe("insights helpers", () => {
    beforeEach(() => {
        vi.useFakeTimers();
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    it("normalizes dates to UTC boundaries", () => {
        const forward = new Date("2024-05-01T23:30:00-02:00");
        const backward = new Date("2024-05-02T00:30:00+02:00");

        expect(dateToKey(forward)).toBe("2024-05-02");
        expect(dateToKey(backward)).toBe("2024-05-01");
    });

    it("handles no attendance", () => {
        vi.setSystemTime(new Date("2024-05-10T12:00:00Z"));

        const empty = new Set<string>();

        expect(calculateCurrentStreak(empty)).toBe(0);
        expect(calculateBestStreak(empty)).toBe(0);
        expect(calculateWeeklyFrequency(empty)).toBe(0);
    });

    it("handles a single attendance day", () => {
        vi.setSystemTime(new Date("2024-05-10T12:00:00Z"));

        const keys = new Set<string>([keyForUtc(2024, 5, 10)]);

        expect(calculateCurrentStreak(keys)).toBe(1);
        expect(calculateBestStreak(keys)).toBe(1);
        expect(calculateWeeklyFrequency(keys)).toBe(0.25);
    });

    it("handles gaps in attendance", () => {
        vi.setSystemTime(new Date("2024-05-10T12:00:00Z"));

        const keys = new Set<string>([
            keyForUtc(2024, 5, 10),
            keyForUtc(2024, 5, 8),
            keyForUtc(2024, 5, 7)
        ]);

        expect(calculateCurrentStreak(keys)).toBe(1);
        expect(calculateBestStreak(keys)).toBe(2);
    });

    it("calculates weekly frequency over the last 4 weeks", () => {
        vi.setSystemTime(new Date("2024-06-28T10:00:00Z"));

        const keys = new Set<string>([
            keyForUtc(2024, 6, 28),
            keyForUtc(2024, 6, 27),
            keyForUtc(2024, 6, 26),
            keyForUtc(2024, 6, 25),
            keyForUtc(2024, 6, 21),
            keyForUtc(2024, 6, 14),
            keyForUtc(2024, 6, 7),
            keyForUtc(2024, 6, 1)
        ]);

        expect(calculateWeeklyFrequency(keys)).toBe(2);
    });
});
