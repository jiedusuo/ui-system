"use client";

// Histogram — pre-binned {lo, hi, count} bar chart, rendered with visx
// (scaleLinear + Bar) on an SVG. Replaces the old uPlot/canvas version.
//
// Used in ratings (per-author max-profit), positions (return
// distribution with clickable bins) and uptime (latency). Bars are
// coloured by a caller-supplied tone callback that returns a key into
// theme tokens; the chart re-reads those tokens (getComputedStyle) and
// re-paints when the OS switches to dark mode or the user flips
// data-theme on <html>. SVG (not canvas) so there is no per-bar
// background box.

import { scaleLinear } from "@visx/scale";
import { Bar } from "@visx/shape";
import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";

export interface Bin {
    lo: number | null;
    hi: number | null;
    count: number;
}

export type HistTone = "ok" | "ok-dim" | "bad" | "warn" | "ink" | "muted" | "dim";

/** Vertical overlay drawn on top of the bars (median, mean, etc).
 *  `x` is in bin-index space: 0 = center of bin 0, fractional values lie
 *  between bin centers. Caller converts value→bin-index. */
export interface HistMarker {
    x: number;
    label?: string;
    tone?: HistTone;
    style?: "solid" | "dashed";
}

export interface HistogramProps {
    bins: Bin[];
    height?: number;
    formatEdge?: (v: number | null) => string;
    tone?: (bin: Bin, index: number) => HistTone;
    highlightIndex?: number | null;
    onBinClick?: ((bin: Bin, index: number) => void) | null;
    showAxis?: boolean;
    axisStride?: number | "auto";
    ariaLabel?: string;
    clickTitle?: (bin: Bin, index: number) => string;
    minBarHeightPx?: number;
    padBottom?: number;
    markers?: HistMarker[];
    /** Paints a faint two-tone wash splitting the plot at this
     *  bin-index-space x: left tinted `bad`, right tinted `ok`. */
    splitX?: number | null;
}

// Every tone maps onto a canonical `--color-*` token, so it resolves under
// each skin (newsprint / jiedusuo) — the SVG `fill` needs a literal string, and
// the only literal here is the neutral grey (--color-dim) used when a token
// can't be read (SSR).
const NEUTRAL = "#8a98ad";
const TOKEN_VAR: Record<HistTone, string> = {
    "ok": "--color-ok",
    "ok-dim": "--color-ok-2",
    "bad": "--color-negative",
    "warn": "--color-ochre",
    "ink": "--color-ink",
    "muted": "--color-muted",
    "dim": "--color-dim",
};

function readColors(): Record<HistTone, string> {
    const cs = typeof document === "undefined" ? null : getComputedStyle(document.documentElement);
    const out = {} as Record<HistTone, string>;
    (Object.keys(TOKEN_VAR) as HistTone[]).forEach((k) => {
        out[k] = cs?.getPropertyValue(TOKEN_VAR[k]).trim() || NEUTRAL;
    });
    return out;
}

export function Histogram({
    bins,
    height = 64,
    formatEdge = (v) => (v == null ? "" : String(v)),
    tone = () => "ok",
    highlightIndex = null,
    onBinClick = null,
    showAxis = true,
    axisStride = "auto",
    ariaLabel = "",
    clickTitle,
    minBarHeightPx = 1,
    padBottom,
    markers = [],
    splitX = null,
}: HistogramProps) {
    const wrapRef = useRef<HTMLDivElement | null>(null);
    const [width, setWidth] = useState(320);
    // Bump on theme change to force a token re-read.
    const [themeTick, setThemeTick] = useState(0);

    useEffect(() => {
        const el = wrapRef.current;
        if (!el || typeof ResizeObserver === "undefined") return;
        const ro = new ResizeObserver((entries) => {
            const w = entries[0]?.contentRect.width ?? 0;
            if (w > 0) setWidth(Math.max(80, Math.round(w)));
        });
        ro.observe(el);
        return () => ro.disconnect();
    }, []);

    useEffect(() => {
        if (typeof window === "undefined") return;
        const bump = () => setThemeTick((t) => t + 1);
        const mq = window.matchMedia("(prefers-color-scheme: dark)");
        mq.addEventListener("change", bump);
        const mo = new MutationObserver(bump);
        mo.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
        return () => {
            mq.removeEventListener("change", bump);
            mo.disconnect();
        };
    }, []);

    // eslint-disable-next-line react-hooks/exhaustive-deps
    const colors = useMemo(() => readColors(), [themeTick]);

    const bottomPad = padBottom ?? (showAxis ? 22 : 4);
    const topPad = 4;
    const plotH = Math.max(0, height - topPad - bottomPad);

    const maxY = Math.max(1, ...bins.map((b) => b.count));
    const yScale = useMemo(
        () => scaleLinear<number>({ domain: [0, maxY], range: [plotH, 0] }),
        [maxY, plotH],
    );

    // Bin index → x pixel center. Domain is [-0.5, n-0.5] like the uPlot
    // original so bars are centered on integer indices.
    const n = bins.length;
    const innerW = Math.max(1, width - 4);
    const xLeft = 2;
    const binW = n > 0 ? innerW / n : innerW;
    const xCenter = (i: number) => xLeft + (i + 0.5) * binW;

    const minRatio = plotH > 0 ? (Math.max(0, minBarHeightPx) / plotH) * maxY : 0;

    const stride =
        axisStride === "auto" ? Math.max(1, Math.ceil(n / 5)) : Math.max(1, axisStride);
    const tickIdx: number[] = [];
    for (let i = 0; i < n; i += stride) tickIdx.push(i);
    if (n > 0 && tickIdx[tickIdx.length - 1] !== n - 1) tickIdx.push(n - 1);

    const tickStyle: CSSProperties = {
        fontFamily: 'var(--mono, ui-monospace, "JetBrains Mono", monospace)',
        fontSize: 9,
        fill: colors.muted,
        fontVariantNumeric: "tabular-nums",
    };

    const hoverTitle =
        clickTitle && n > 0
            ? bins.map((b, i) => clickTitle(b, i)).filter(Boolean).join(" · ")
            : undefined;

    const splitPx = splitX != null && n > 0 ? xCenter(splitX) : null;

    return (
        <div
            ref={wrapRef}
            role="img"
            aria-label={ariaLabel}
            title={hoverTitle}
            style={{ width: "100%", lineHeight: 0, minHeight: 32, position: "relative" }}
        >
            {n > 0 && (
                <svg width={width} height={height} style={{ display: "block" }}>
                    {/* win/loss split wash */}
                    {splitPx != null && (
                        <>
                            <rect
                                x={xLeft}
                                y={topPad}
                                width={Math.max(0, Math.min(xLeft + innerW, splitPx) - xLeft)}
                                height={plotH}
                                fill={colors.bad}
                                opacity={0.07}
                            />
                            <rect
                                x={Math.max(xLeft, Math.min(xLeft + innerW, splitPx))}
                                y={topPad}
                                width={Math.max(0, xLeft + innerW - Math.max(xLeft, splitPx))}
                                height={plotH}
                                fill={colors.ok}
                                opacity={0.07}
                            />
                        </>
                    )}

                    {/* bars */}
                    {bins.map((b, i) => {
                        const fill = colors[tone(b, i)] ?? colors.ok;
                        const stroke = highlightIndex === i ? colors.ink : fill;
                        const yVal = b.count > 0 ? Math.max(b.count, minRatio) : 0;
                        const barH = topPad + plotH - yScale(yVal);
                        const w = Math.max(1, binW - 1);
                        return (
                            <Bar
                                key={i}
                                x={xCenter(i) - w / 2}
                                y={yScale(yVal) + topPad}
                                width={w}
                                height={Math.max(0, barH)}
                                fill={fill}
                                stroke={stroke}
                                strokeWidth={highlightIndex === i ? 1 : 0}
                                style={onBinClick ? { cursor: "pointer" } : undefined}
                                onClick={onBinClick ? () => onBinClick(b, i) : undefined}
                            >
                                {clickTitle && <title>{clickTitle(b, i)}</title>}
                            </Bar>
                        );
                    })}

                    {/* markers (median / mean) */}
                    {markers.map((mk, i) => {
                        const c = colors[mk.tone ?? "ink"] ?? colors.ink;
                        const px = xCenter(mk.x);
                        if (!Number.isFinite(px)) return null;
                        return (
                            <g key={`mk${i}`}>
                                <line
                                    x1={px}
                                    x2={px}
                                    y1={topPad}
                                    y2={topPad + plotH}
                                    stroke={c}
                                    strokeWidth={1}
                                    strokeDasharray={mk.style === "dashed" ? "4 3" : undefined}
                                />
                                {mk.label && (
                                    <text x={px + 3} y={topPad + 2} dominantBaseline="hanging" style={{ ...tickStyle, fill: c }}>
                                        {mk.label}
                                    </text>
                                )}
                            </g>
                        );
                    })}

                    {/* x axis tick labels */}
                    {showAxis &&
                        tickIdx.map((i) => {
                            const bin = bins[i];
                            if (!bin) return null;
                            return (
                                <text
                                    key={`t${i}`}
                                    x={xCenter(i)}
                                    y={height - 6}
                                    textAnchor="middle"
                                    style={tickStyle}
                                >
                                    {formatEdge(bin.lo)}
                                </text>
                            );
                        })}
                </svg>
            )}
        </div>
    );
}
