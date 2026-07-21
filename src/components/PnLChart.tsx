// PnL sparkline + dashed entry-reference + max/min anchors.
// Pure SVG, no charting library. Stroke colour comes from the
// `up` flag; the entry price is rendered as a dashed horizontal
// reference line. Timestamped points are split across long gaps so
// overnight/weekend market closures do not render as one continuous
// price move.

export interface PnLPoint {
    value: number;
    time?: string | number | Date;
}

interface Props {
    series: readonly (number | PnLPoint)[];
    entry: number;
    /** Up = sage stroke + olive fill; down = vermilion + brick-red fill. */
    up: boolean;
    /** Mono label for the left x-axis anchor (e.g. "23m" / "1h 47m"). */
    age?: string;
    privateMode?: boolean;
    privateLabel?: string;
    width?: number;
    height?: number;
}

export function PnLChart({ series, entry, up, age, width = 280, height = 64 }: Props) {
    const points = normalizeSeries(series);
    if (points.length < 2) return null;

    const min = Math.min(...points.map((p) => p.value), entry);
    const max = Math.max(...points.map((p) => p.value), entry);
    const pad = (max - min || 0.01) * 0.18;
    const yMin = min - pad;
    const yMax = max + pad;
    const yRange = yMax - yMin || 1;

    const x = (i: number) => (i / (points.length - 1)) * width;
    const y = (v: number) => height - ((v - yMin) / yRange) * height;

    const pts = points.map((p, i) => ({ ...p, x: x(i), y: y(p.value) }));
    const segments = splitSegments(pts);
    const entryY = y(entry);
    const last = pts[pts.length - 1]!;
    const stroke = up ? "var(--color-gain)" : "var(--color-negative)";
    const fill = up
        ? "var(--color-ok-tint, var(--color-tint-ok))"
        : "var(--color-tint-negative)";

    return (
        <div className="relative">
            <svg
                viewBox={`0 0 ${width} ${height}`}
                preserveAspectRatio="none"
                className="border-ink block w-full border-b"
                style={{ height: 70, borderBottomWidth: "var(--border-rule-hair)" }}
            >
                <line
                    x1="0"
                    y1={entryY}
                    x2={width}
                    y2={entryY}
                    stroke="var(--color-dim)"
                    strokeWidth="0.7"
                    strokeDasharray="4 3"
                />
                {segments.map((segment, i) => {
                    const d = pathFor(segment);
                    const first = segment[0]!;
                    const final = segment[segment.length - 1]!;
                    return (
                        <g key={i}>
                            <path
                                d={`${d} L ${final.x.toFixed(1)},${height} L ${first.x.toFixed(1)},${height} Z`}
                                fill={fill}
                            />
                            <path d={d} fill="none" stroke={stroke} strokeWidth="1.5" />
                        </g>
                    );
                })}
                <circle cx={last.x} cy={last.y} r="3" fill={stroke} />
            </svg>
            <div
                className="mt-1 flex justify-between uppercase"
                style={{
                    fontFamily: "var(--font-sans)",
                    fontSize: "var(--text-mini)",
                    color: "var(--color-dim)",
                    letterSpacing: "0.12em",
                }}
            >
                <span>{age ? `−${age}` : ""}</span>
                <span style={{ color: "var(--color-muted)", fontFeatureSettings: '"tnum"' }}>
                    entry
                </span>
                <span>now</span>
            </div>
        </div>
    );
}

function normalizeSeries(series: readonly (number | PnLPoint)[]) {
    return series
        .map((point) =>
            typeof point === "number"
                ? { value: point, timeMs: null }
                : { value: point.value, timeMs: toTimeMs(point.time) },
        )
        .filter((point) => Number.isFinite(point.value));
}

function toTimeMs(value: PnLPoint["time"]): number | null {
    if (value === undefined) return null;
    const ms = value instanceof Date ? value.getTime() : new Date(value).getTime();
    return Number.isFinite(ms) ? ms : null;
}

function splitSegments<T extends { x: number; y: number; timeMs: number | null }>(
    points: readonly T[],
): T[][] {
    const diffs = points
        .slice(1)
        .map((point, i) =>
            point.timeMs !== null && points[i]?.timeMs !== null
                ? point.timeMs - (points[i]?.timeMs ?? point.timeMs)
                : null,
        )
        .filter((diff): diff is number => diff !== null && diff > 0)
        .sort((a, b) => a - b);
    if (diffs.length === 0) return [points.slice()];

    const median = diffs[Math.floor(diffs.length / 2)] ?? 0;
    const gapMs = Math.max(median * 3, 20 * 60 * 1000);
    const segments: T[][] = [[points[0]!]];
    for (let i = 1; i < points.length; i += 1) {
        const prev = points[i - 1]!;
        const point = points[i]!;
        const gap = point.timeMs !== null && prev.timeMs !== null ? point.timeMs - prev.timeMs : 0;
        if (gap > gapMs) segments.push([]);
        segments[segments.length - 1]!.push(point);
    }
    return segments.filter((segment) => segment.length >= 2);
}

function pathFor(points: readonly { x: number; y: number }[]): string {
    return points
        .map((point, i) => `${i ? "L" : "M"}${point.x.toFixed(1)},${point.y.toFixed(1)}`)
        .join(" ");
}
