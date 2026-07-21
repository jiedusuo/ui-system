import { TickMarkType, type Time } from "lightweight-charts";

const pad2 = (n: number): string => String(n).padStart(2, "0");

function dateFromChartTime(time: Time): Date | null {
    if (typeof time === "number") {
        return new Date(time * 1000);
    }

    if (typeof time === "string") {
        const dayMatch = /^(\d{4})-(\d{2})-(\d{2})$/.exec(time);
        if (dayMatch) {
            const [, y, m, d] = dayMatch;
            return new Date(Number(y), Number(m) - 1, Number(d));
        }
        const parsed = new Date(time);
        return Number.isFinite(parsed.getTime()) ? parsed : null;
    }

    if (time && typeof time === "object") {
        return new Date(time.year, time.month - 1, time.day);
    }

    return null;
}

export function localTimeZoneName(date = new Date()): string {
    try {
        const tz = new Intl.DateTimeFormat(undefined, { timeZoneName: "short" })
            .formatToParts(date)
            .find((part) => part.type === "timeZoneName")?.value;
        if (tz) return tz;
    } catch {
        // Fall through to the resolved IANA timezone, then a plain local fallback.
    }

    try {
        return Intl.DateTimeFormat().resolvedOptions().timeZone || "local";
    } catch {
        return "local";
    }
}

export function formatLocalClock(date = new Date()): string {
    return `${pad2(date.getHours())}:${pad2(date.getMinutes())}:${pad2(date.getSeconds())} ${localTimeZoneName(date)}`;
}

export function formatLocalChartTick(time: Time, tickMarkType: TickMarkType): string | null {
    const date = dateFromChartTime(time);
    if (!date) return null;

    switch (tickMarkType) {
        case TickMarkType.Year:
            return String(date.getFullYear());
        case TickMarkType.Month:
        case TickMarkType.DayOfMonth:
            return `${date.getMonth() + 1}/${date.getDate()}`;
        case TickMarkType.TimeWithSeconds:
            return `${pad2(date.getHours())}:${pad2(date.getMinutes())}:${pad2(date.getSeconds())}`;
        case TickMarkType.Time:
        default:
            return `${pad2(date.getHours())}:${pad2(date.getMinutes())}`;
    }
}

export function formatLocalChartTime(time: Time): string {
    const date = dateFromChartTime(time);
    if (!date) return String(time);

    return `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())} ${pad2(
        date.getHours(),
    )}:${pad2(date.getMinutes())}:${pad2(date.getSeconds())} ${localTimeZoneName(date)}`;
}
