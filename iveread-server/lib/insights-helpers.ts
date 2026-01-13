const MS_PER_DAY = 24 * 60 * 60 * 1000;

export type WeekdayDistribution = {
    mon: number;
    tue: number;
    wed: number;
    thu: number;
    fri: number;
    sat: number;
    sun: number;
};

export function dateToKey(date: Date): string {
    const year = date.getUTCFullYear();
    const month = String(date.getUTCMonth() + 1).padStart(2, "0");
    const day = String(date.getUTCDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
}

export function keyToDate(key: string): Date {
    const [year, month, day] = key.split("-").map(Number);
    return new Date(Date.UTC(year, month - 1, day));
}

export function addDaysUTC(date: Date, days: number): Date {
    return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate() + days));
}

export function daysBetweenUTC(start: Date, end: Date): number {
    const startUtc = Date.UTC(start.getUTCFullYear(), start.getUTCMonth(), start.getUTCDate());
    const endUtc = Date.UTC(end.getUTCFullYear(), end.getUTCMonth(), end.getUTCDate());
    return (endUtc - startUtc) / MS_PER_DAY;
}

export function buildWeekdayDistribution(dates: Date[]): WeekdayDistribution {
    const distribution: WeekdayDistribution = {
        mon: 0,
        tue: 0,
        wed: 0,
        thu: 0,
        fri: 0,
        sat: 0,
        sun: 0
    };

    for (const date of dates) {
        switch (date.getUTCDay()) {
            case 1:
                distribution.mon += 1;
                break;
            case 2:
                distribution.tue += 1;
                break;
            case 3:
                distribution.wed += 1;
                break;
            case 4:
                distribution.thu += 1;
                break;
            case 5:
                distribution.fri += 1;
                break;
            case 6:
                distribution.sat += 1;
                break;
            case 0:
            default:
                distribution.sun += 1;
                break;
        }
    }

    return distribution;
}

export function calculateCurrentStreak(dateKeys: Set<string>): number {
    if (dateKeys.size === 0) return 0;

    let streak = 0;
    const now = new Date();
    let cursor = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));

    while (dateKeys.has(dateToKey(cursor))) {
        streak += 1;
        cursor = addDaysUTC(cursor, -1);
    }

    return streak;
}

export function calculateBestStreak(dateKeys: Set<string>): number {
    if (dateKeys.size === 0) return 0;

    const sortedKeys = Array.from(dateKeys).sort();
    let best = 0;
    let current = 0;
    let prevDate: Date | null = null;

    for (const key of sortedKeys) {
        const currentDate = keyToDate(key);

        if (prevDate && dateToKey(addDaysUTC(prevDate, 1)) === key) {
            current += 1;
        } else {
            current = 1;
        }

        if (current > best) best = current;
        prevDate = currentDate;
    }

    return best;
}

export function calculateWeeklyFrequency(dateKeys: Set<string>): number {
    if (dateKeys.size === 0) return 0;

    const now = new Date();
    const today = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
    const cutoff = addDaysUTC(today, -27);
    const cutoffUtc = Date.UTC(cutoff.getUTCFullYear(), cutoff.getUTCMonth(), cutoff.getUTCDate());

    let count = 0;

    for (const key of dateKeys) {
        const date = keyToDate(key);
        const dateUtc = Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());
        if (dateUtc >= cutoffUtc) {
            count += 1;
        }
    }

    return count / 4;
}
