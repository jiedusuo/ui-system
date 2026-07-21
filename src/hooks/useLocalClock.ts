"use client";

import { useEffect, useState } from "react";
import { formatLocalClock } from "../lib/chart-time";

export function useLocalClock(): string {
    const [now, setNow] = useState<string>("");
    useEffect(() => {
        setNow(formatLocalClock(new Date()));
        const id = window.setInterval(() => setNow(formatLocalClock(new Date())), 1000);
        return () => window.clearInterval(id);
    }, []);
    return now;
}
