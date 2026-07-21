// Sparkline — tiny themeable SVG line+area for a 0..1 series (rolling
// win-rate on the ratings page). No external dep: plain SVG, all colour
// from theme tokens via inline var() so it re-paints when the OS flips
// to dark and works under any app's palette (newsprint or emerald).
// Stroke width stays constant under the non-uniform viewBox stretch via
// vector-effect:non-scaling-stroke. Ported 1:1 from the SvelteKit
// Sparkline.svelte.

import type { CSSProperties } from "react";

type Tone = "ok" | "primary" | "muted";

export interface SparklineProps {
    values: number[];
    /** Y range. Defaults to a win-rate axis (0..1). */
    min?: number;
    max?: number;
    height?: number;
    /** Horizontal guide line in data units (e.g. 0.5 = coin-flip). */
    refLine?: number | null;
    tone?: Tone;
    fill?: boolean;
    ariaLabel?: string;
}

const VBW = 100;

const LINE_STROKE: Record<Tone, string> = {
    ok: "var(--color-ok, var(--color-primary))",
    primary: "var(--color-primary)",
    muted: "var(--color-muted)",
};
const AREA_FILL: Record<Tone, string> = {
    ok: "var(--color-ok-tint, var(--color-tint-ok))",
    primary: "var(--color-tint-primary)",
    muted: "var(--color-tint-primary)",
};

export function Sparkline({
    values,
    min = 0,
    max = 1,
    height = 36,
    refLine = null,
    tone = "ok",
    fill = true,
    ariaLabel = "",
}: SparklineProps) {
    const span = max - min || 1;

    const pts: Array<readonly [number, number]> = (() => {
        const ys = values.filter((v) => Number.isFinite(v));
        if (ys.length === 0) return [];
        const n = values.length;
        return values.map((y, i) => {
            const x = n <= 1 ? VBW / 2 : (i / (n - 1)) * VBW;
            const clamped = Math.min(max, Math.max(min, y));
            const yy = height - ((clamped - min) / span) * height;
            return [x, yy] as const;
        });
    })();

    const first = pts[0];
    const last = pts.at(-1);

    const linePath = !first
        ? ""
        : pts.length === 1
          ? `M 0 ${first[1].toFixed(2)} L ${VBW} ${first[1].toFixed(2)}`
          : "M " + pts.map((p) => `${p[0].toFixed(2)} ${p[1].toFixed(2)}`).join(" L ");

    const areaPath =
        first && last && pts.length >= 2
            ? `M ${first[0].toFixed(2)} ${height} L ` +
              pts.map((p) => `${p[0].toFixed(2)} ${p[1].toFixed(2)}`).join(" L ") +
              ` L ${last[0].toFixed(2)} ${height} Z`
            : "";

    const refY =
        refLine == null
            ? null
            : height - ((Math.min(max, Math.max(min, refLine)) - min) / span) * height;

    const lineStyle: CSSProperties = {
        fill: "none",
        stroke: LINE_STROKE[tone],
        strokeWidth: 1.5,
        strokeLinejoin: "round",
        strokeLinecap: "round",
        vectorEffect: "non-scaling-stroke",
    };

    return (
        <svg
            viewBox={`0 0 ${VBW} ${height}`}
            height={height}
            preserveAspectRatio="none"
            role="img"
            aria-label={ariaLabel}
            style={{ display: "block", width: "100%" }}
        >
            {pts.length > 0 && (
                <>
                    {refY != null && (
                        <line
                            x1={0}
                            x2={VBW}
                            y1={refY}
                            y2={refY}
                            style={{
                                stroke: "var(--color-rule-soft)",
                                strokeWidth: 1,
                                strokeDasharray: "2 3",
                                vectorEffect: "non-scaling-stroke",
                            }}
                        />
                    )}
                    {fill && areaPath && (
                        <path d={areaPath} style={{ stroke: "none", fill: AREA_FILL[tone] }} />
                    )}
                    <path d={linePath} style={lineStyle} />
                </>
            )}
        </svg>
    );
}
