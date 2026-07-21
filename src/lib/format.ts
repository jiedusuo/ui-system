// Display helpers — money / pct / age / OCC tickers. Both apps
// render the same number conventions; keep this file authoritative.

export function fmtMoney(value: number | null | undefined, decimals = 2): string {
    if (value === null || value === undefined || !Number.isFinite(value)) return "—";
    const sign = value < 0 ? "−" : "";
    const abs = Math.abs(value);
    return abs >= 1000
        ? `${sign}$${abs.toLocaleString("en-US", {
              minimumFractionDigits: decimals,
              maximumFractionDigits: decimals,
          })}`
        : `${sign}$${abs.toFixed(decimals)}`;
}

export function fmtPct(value: number | null | undefined, decimals = 1): string {
    if (value === null || value === undefined || !Number.isFinite(value)) return "—";
    const pct = value * 100;
    const sign = pct > 0 ? "+" : pct < 0 ? "−" : "";
    return `${sign}${Math.abs(pct).toFixed(decimals)}%`;
}

export function pnlPct(
    entry: number | null | undefined,
    mark: number | null | undefined,
): number | null {
    if (entry === null || entry === undefined || !Number.isFinite(entry) || entry <= 0) return null;
    if (mark === null || mark === undefined || !Number.isFinite(mark)) return null;
    return (mark - entry) / entry;
}

export function fmtAge(iso: string | null | undefined, now: number = Date.now()): string {
    if (!iso) return "—";
    const t = Date.parse(iso);
    if (!Number.isFinite(t)) return "—";
    const dt = (now - t) / 1000;
    if (dt < 60) return `${Math.max(0, Math.floor(dt))}s`;
    if (dt < 3600) return `${Math.floor(dt / 60)}m`;
    if (dt < 86400) {
        const h = Math.floor(dt / 3600);
        const m = Math.floor((dt % 3600) / 60);
        return m > 0 ? `${h}h ${String(m).padStart(2, "0")}m` : `${h}h`;
    }
    return `${Math.floor(dt / 86400)}d`;
}

/** OCC → "TICKER YYMMDD STRIKEC|P" e.g. "AAPL 240520 195C". */
export function fmtOcc(occ: string | null | undefined): string {
    if (!occ) return "—";
    const m = occ.match(/^([A-Z]+)\s*(\d{6})([CP])(\d{8})$/);
    if (!m) return occ;
    const [, root, yymmdd, kind, strikeRaw] = m;
    const strike = (parseInt(strikeRaw!, 10) / 1000).toFixed(2).replace(/\.00$/, "");
    return `${root} ${yymmdd} ${strike}${kind}`;
}

/** OCC → "TICKER STRIKEC|P M/D" with optional "(0DTE|weekly|swing)" vs a reference timestamp. */
export function fmtOccBrief(occ: string | null | undefined, refIso?: string | null): string {
    if (!occ) return "";
    const m = occ.match(/^([A-Z]+)\s*(\d{6})([CP])(\d{8})$/i);
    if (!m) return occ;
    const [, root, yymmdd, kind, strikeRaw] = m;
    const yy = Number(yymmdd!.slice(0, 2));
    const mm = Number(yymmdd!.slice(2, 4));
    const dd = Number(yymmdd!.slice(4, 6));
    const fullYear = yy >= 70 ? 1900 + yy : 2000 + yy;
    const strike = (parseInt(strikeRaw!, 10) / 1000).toFixed(2).replace(/\.00$/, "");
    const expiry = `${mm}/${dd}`;
    const bucket = contractBucket(refIso, fullYear, mm, dd);
    return `${root!.toUpperCase()} ${strike}${kind!.toUpperCase()} ${expiry}${
        bucket ? ` (${bucket})` : ""
    }`;
}

function contractBucket(
    refIso: string | null | undefined,
    year: number,
    month: number,
    day: number,
): "0DTE" | "weekly" | "swing" | "" {
    if (!refIso) return "";
    const t = Date.parse(refIso);
    if (!Number.isFinite(t)) return "";
    const ref = new Date(t);
    const expiry = new Date(Date.UTC(year, month - 1, day));
    const refMidnight = Date.UTC(ref.getUTCFullYear(), ref.getUTCMonth(), ref.getUTCDate());
    const expiryMidnight = expiry.getTime();
    if (refMidnight === expiryMidnight) return "0DTE";

    const refDay = new Date(refMidnight).getUTCDay();
    const daysSinceMonday = (refDay + 6) % 7;
    const weekStart = refMidnight - daysSinceMonday * 86400000;
    const weekEnd = weekStart + 7 * 86400000;
    return expiryMidnight > refMidnight && expiryMidnight < weekEnd ? "weekly" : "swing";
}

/** Numeric delta with triangle prefix. */
export function fmtDeltaTriangle(value: number, decimals = 1): { glyph: "▲" | "▼"; pct: string } {
    return {
        glyph: value >= 0 ? "▲" : "▼",
        pct: `${Math.abs(value * 100).toFixed(decimals)}%`,
    };
}
