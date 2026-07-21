"use client";

// Scatter — small themeable SVG scatter for per-trade points. Built for
// the /ratings drawdown-vs-return chart but generic over `{x, y}` data.
// All colour comes from theme tokens via inline var() so it re-paints
// when the OS flips to dark. Ported 1:1 from the SvelteKit
// Scatter.svelte ($state/$derived/$effect → useState/useMemo/useEffect,
// bind:this → useRef).

import { useEffect, useMemo, useRef, useState, type CSSProperties, type PointerEvent } from "react";

export type ScatterPointTone = "ok" | "bad" | "warn" | "muted" | "primary";

export interface ScatterPoint {
    x: number;
    y: number;
    /** Optional per-point tone. Default falls back to `tone` prop. */
    tone?: ScatterPointTone;
    /** Optional title (hover tooltip). */
    title?: string;
}

export interface ScatterProps {
    points: ScatterPoint[];
    /** X-axis bounds in data units. Defaults auto-fit with padding. */
    xMin?: number | null;
    xMax?: number | null;
    /** Y-axis bounds in data units. Defaults auto-fit with padding. */
    yMin?: number | null;
    yMax?: number | null;
    height?: number;
    /** Default point tone if the point doesn't specify one. */
    tone?: ScatterPointTone;
    /** Radius of each point in px (constant under non-uniform scale). */
    radius?: number;
    /** Horizontal guide line at `refY` (data units). */
    refY?: number | null;
    /** Vertical guide line at `refX` (data units). */
    refX?: number | null;
    /** Axis tick values + labels in data units. */
    xTicks?: Array<{ at: number; label: string }>;
    yTicks?: Array<{ at: number; label: string }>;
    /** Axis labels rendered as low-key annotations. */
    xLabel?: string;
    yLabel?: string;
    ariaLabel?: string;
}

const MIN_VBW = 320;
const PAD_LEFT = 36;
const PAD_RIGHT = 8;
const PAD_TOP = 8;
const PAD_BOTTOM = 22;
const HIT_RADIUS = 14;

const POINT_FILL: Record<ScatterPointTone, string> = {
    ok: "var(--color-ok)",
    bad: "var(--color-negative)",
    warn: "var(--color-warn, var(--color-ochre))",
    muted: "var(--color-muted)",
    primary: "var(--color-primary)",
};

const RULE_SOFT = "var(--color-rule-soft)";
const RULE = "var(--color-rule)";
const MUTED = "var(--color-muted)";
const INK = "var(--color-ink)";
const PAPER = "var(--color-paper)";

const TICK_STYLE: CSSProperties = {
    fontFamily: "var(--mono, var(--font-sans, monospace))",
    fontSize: 9,
    fill: MUTED,
    fontVariantNumeric: "tabular-nums",
};
const AXIS_LABEL_STYLE: CSSProperties = {
    ...TICK_STYLE,
    letterSpacing: "0.08em",
    textTransform: "uppercase",
};

function clamp(value: number, min: number, max: number): number {
    return Math.min(max, Math.max(min, value));
}

function tooltipLines(title: string | undefined): string[] {
    return (title ?? "")
        .split(/\n+/)
        .map((line) => line.trim())
        .filter(Boolean)
        .slice(0, 4);
}

function truncateLine(line: string, maxChars: number): string {
    return line.length > maxChars ? `${line.slice(0, Math.max(0, maxChars - 3))}...` : line;
}

export function Scatter({
    points,
    xMin = null,
    xMax = null,
    yMin = null,
    yMax = null,
    height = 220,
    tone = "ok",
    radius = 2.6,
    refY = null,
    refX = null,
    xTicks = [],
    yTicks = [],
    xLabel = "",
    yLabel = "",
    ariaLabel = "",
}: ScatterProps) {
    const svgRef = useRef<SVGSVGElement | null>(null);
    const [svgWidth, setSvgWidth] = useState(MIN_VBW);
    const [activeIndex, setActiveIndex] = useState<number | null>(null);

    const plotW = svgWidth - PAD_LEFT - PAD_RIGHT;
    const plotH = height - PAD_TOP - PAD_BOTTOM;

    const validPoints = useMemo(
        () => points.filter((p) => Number.isFinite(p.x) && Number.isFinite(p.y)),
        [points],
    );

    // Auto-fit with 4% padding when the caller didn't pin an axis. Empty
    // data → unit range so we don't render a degenerate chart.
    const bounds = useMemo(() => {
        if (validPoints.length === 0) {
            return { x0: -1, x1: 0, y0: 0, y1: 1 };
        }
        const xs = validPoints.map((p) => p.x);
        const ys = validPoints.map((p) => p.y);
        const xLo = xMin ?? Math.min(...xs);
        const xHi = xMax ?? Math.max(...xs);
        const yLo = yMin ?? Math.min(...ys);
        const yHi = yMax ?? Math.max(...ys);
        const xSpan = Math.max(1e-9, xHi - xLo);
        const ySpan = Math.max(1e-9, yHi - yLo);
        return {
            x0: xMin ?? xLo - xSpan * 0.04,
            x1: xMax ?? xHi + xSpan * 0.04,
            y0: yMin ?? yLo - ySpan * 0.04,
            y1: yMax ?? yHi + ySpan * 0.04,
        };
    }, [validPoints, xMin, xMax, yMin, yMax]);

    const xPx = (x: number) => {
        const span = bounds.x1 - bounds.x0 || 1;
        return PAD_LEFT + ((x - bounds.x0) / span) * plotW;
    };
    const yPx = (y: number) => {
        const span = bounds.y1 - bounds.y0 || 1;
        // SVG y grows downward; flip so larger y is higher on screen.
        return PAD_TOP + plotH - ((y - bounds.y0) / span) * plotH;
    };

    const refYpx = refY == null ? null : yPx(refY);
    const refXpx = refX == null ? null : xPx(refX);
    const plottedPoints = validPoints.map((point, index) => ({
        point,
        index,
        cx: xPx(point.x),
        cy: yPx(point.y),
    }));
    const activePoint =
        activeIndex == null || activeIndex < 0 || activeIndex >= validPoints.length
            ? null
            : validPoints[activeIndex];
    const activeLines = tooltipLines(activePoint?.title);
    const activeX = activePoint ? xPx(activePoint.x) : 0;
    const activeY = activePoint ? yPx(activePoint.y) : 0;
    const tooltipLineHeight = 13;
    const tooltipPadX = 8;
    const tooltipPadY = 6;
    const maxTooltipW = Math.max(120, Math.min(280, svgWidth - 8));
    const maxTooltipChars = Math.max(12, Math.floor((maxTooltipW - tooltipPadX * 2) / 6.1));
    const displayLines = activeLines.map((line) => truncateLine(line, maxTooltipChars));
    const longestTooltipLine = displayLines.reduce((max, line) => Math.max(max, line.length), 0);
    const tooltipW = Math.min(
        maxTooltipW,
        Math.max(132, longestTooltipLine * 6.1 + tooltipPadX * 2),
    );
    const tooltipH = displayLines.length * tooltipLineHeight + tooltipPadY * 2;
    const tooltipX = clamp(
        activeX + tooltipW + 12 <= svgWidth ? activeX + 10 : activeX - tooltipW - 10,
        4,
        Math.max(4, svgWidth - tooltipW - 4),
    );
    const tooltipY = clamp(
        activeY - tooltipH - 10 >= 4 ? activeY - tooltipH - 10 : activeY + 10,
        4,
        Math.max(4, height - tooltipH - 4),
    );

    useEffect(() => {
        const el = svgRef.current;
        if (!el || typeof ResizeObserver === "undefined") return;
        const ro = new ResizeObserver((entries) => {
            const w = entries[0]?.contentRect.width ?? 0;
            if (w > 0) setSvgWidth(Math.max(MIN_VBW, Math.round(w)));
        });
        ro.observe(el);
        return () => ro.disconnect();
    }, []);

    const onPointerMove = (event: PointerEvent<SVGSVGElement>) => {
        const rect = svgRef.current?.getBoundingClientRect();
        if (!rect || rect.width <= 0 || rect.height <= 0 || plottedPoints.length === 0) return;
        const px = ((event.clientX - rect.left) / rect.width) * svgWidth;
        const py = ((event.clientY - rect.top) / rect.height) * height;
        if (
            px < PAD_LEFT - HIT_RADIUS ||
            px > PAD_LEFT + plotW + HIT_RADIUS ||
            py < PAD_TOP - HIT_RADIUS ||
            py > PAD_TOP + plotH + HIT_RADIUS
        ) {
            setActiveIndex(null);
            return;
        }
        let bestIndex: number | null = null;
        let bestDistance = HIT_RADIUS * HIT_RADIUS;
        for (const p of plottedPoints) {
            const dx = px - p.cx;
            const dy = py - p.cy;
            const d2 = dx * dx + dy * dy;
            if (d2 <= bestDistance) {
                bestDistance = d2;
                bestIndex = p.index;
            }
        }
        setActiveIndex(bestIndex);
    };

    return (
        <svg
            ref={svgRef}
            viewBox={`0 0 ${svgWidth} ${height}`}
            height={height}
            role="img"
            aria-label={ariaLabel}
            style={{ display: "block", width: "100%" }}
            onPointerMove={onPointerMove}
            onPointerLeave={() => setActiveIndex(null)}
        >
            {/* plot frame */}
            <rect
                x={PAD_LEFT}
                y={PAD_TOP}
                width={plotW}
                height={plotH}
                style={{ fill: "none", stroke: RULE_SOFT, strokeWidth: 1, vectorEffect: "non-scaling-stroke" }}
            />
            <rect
                x={PAD_LEFT}
                y={PAD_TOP}
                width={plotW}
                height={plotH}
                style={{ fill: "transparent", stroke: "none", pointerEvents: "all" }}
            />

            {/* gridlines + tick labels */}
            {xTicks.map((t) => {
                const px = xPx(t.at);
                return (
                    <g key={`x${t.at}`}>
                        <line
                            x1={px}
                            x2={px}
                            y1={PAD_TOP}
                            y2={PAD_TOP + plotH}
                            style={{ stroke: RULE_SOFT, strokeWidth: 1, strokeDasharray: "2 3", vectorEffect: "non-scaling-stroke", opacity: 0.55 }}
                        />
                        <text x={px} y={PAD_TOP + plotH + 12} textAnchor="middle" style={TICK_STYLE}>
                            {t.label}
                        </text>
                    </g>
                );
            })}
            {yTicks.map((t) => {
                const py = yPx(t.at);
                return (
                    <g key={`y${t.at}`}>
                        <line
                            x1={PAD_LEFT}
                            x2={PAD_LEFT + plotW}
                            y1={py}
                            y2={py}
                            style={{ stroke: RULE_SOFT, strokeWidth: 1, strokeDasharray: "2 3", vectorEffect: "non-scaling-stroke", opacity: 0.55 }}
                        />
                        <text x={PAD_LEFT - 4} y={py + 3} textAnchor="end" style={TICK_STYLE}>
                            {t.label}
                        </text>
                    </g>
                );
            })}

            {/* reference lines (drawn after grid so they sit on top) */}
            {refYpx != null && (
                <line
                    x1={PAD_LEFT}
                    x2={PAD_LEFT + plotW}
                    y1={refYpx}
                    y2={refYpx}
                    style={{ stroke: RULE, strokeWidth: 1, strokeDasharray: "4 4", vectorEffect: "non-scaling-stroke", opacity: 0.8 }}
                />
            )}
            {refXpx != null && (
                <line
                    x1={refXpx}
                    x2={refXpx}
                    y1={PAD_TOP}
                    y2={PAD_TOP + plotH}
                    style={{ stroke: RULE, strokeWidth: 1, strokeDasharray: "4 4", vectorEffect: "non-scaling-stroke", opacity: 0.8 }}
                />
            )}

            {/* points */}
            {plottedPoints.map(({ point: p, index: i, cx, cy }) => {
                return (
                    <g key={i}>
                        <circle
                            cx={cx}
                            cy={cy}
                            r={radius}
                            style={{
                                stroke: "none",
                                fill: POINT_FILL[p.tone ?? tone],
                                opacity: 0.78,
                                pointerEvents: "none",
                            }}
                        />
                        <circle
                            cx={cx}
                            cy={cy}
                            r={Math.max(8, radius + 5)}
                            tabIndex={p.title ? 0 : undefined}
                            aria-label={p.title}
                            onMouseEnter={() => setActiveIndex(i)}
                            onFocus={() => setActiveIndex(i)}
                            onBlur={() =>
                                setActiveIndex((current) => (current === i ? null : current))
                            }
                            style={{
                                fill: "transparent",
                                stroke: "none",
                                cursor: p.title ? "crosshair" : "default",
                                pointerEvents: "all",
                            }}
                        />
                    </g>
                );
            })}

            {activePoint && displayLines.length > 0 && (
                <g pointerEvents="none">
                    <circle
                        cx={activeX}
                        cy={activeY}
                        r={radius + 2.25}
                        style={{
                            fill: "none",
                            stroke: INK,
                            strokeWidth: 1.2,
                            vectorEffect: "non-scaling-stroke",
                        }}
                    />
                    <rect
                        x={tooltipX}
                        y={tooltipY}
                        width={tooltipW}
                        height={tooltipH}
                        rx={2}
                        style={{
                            fill: PAPER,
                            stroke: RULE,
                            strokeWidth: 1,
                            vectorEffect: "non-scaling-stroke",
                        }}
                    />
                    <text
                        x={tooltipX + tooltipPadX}
                        y={tooltipY + tooltipPadY + 9}
                        style={{
                            fontFamily: "var(--mono, var(--font-sans, monospace))",
                            fontSize: 10,
                            fill: INK,
                            fontVariantNumeric: "tabular-nums",
                        }}
                    >
                        {displayLines.map((line, i) => (
                            <tspan
                                key={i}
                                x={tooltipX + tooltipPadX}
                                dy={i === 0 ? 0 : tooltipLineHeight}
                            >
                                {line}
                            </tspan>
                        ))}
                    </text>
                </g>
            )}

            {/* axis labels */}
            {xLabel && (
                <text x={PAD_LEFT + plotW / 2} y={height - 3} textAnchor="middle" style={AXIS_LABEL_STYLE}>
                    {xLabel}
                </text>
            )}
            {yLabel && (
                <text
                    x={4}
                    y={PAD_TOP + plotH / 2}
                    textAnchor="middle"
                    transform={`rotate(-90 4 ${PAD_TOP + plotH / 2})`}
                    style={AXIS_LABEL_STYLE}
                >
                    {yLabel}
                </text>
            )}
        </svg>
    );
}
