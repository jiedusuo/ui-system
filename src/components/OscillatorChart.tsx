"use client";

// Compact indicator sub-pane (MACD / RSI) rendered as its own
// lightweight-charts chart stacked beneath a CandleChart — lightweight-
// charts v4 has no native multi-pane support, so oscillators live in
// their own chart with a shared time axis. Newsprint tokens are read at
// runtime so it themes with the rest of the site.

import { useEffect, useRef } from "react";
import {
    ColorType,
    CrosshairMode,
    LineStyle,
    createChart,
    type ISeriesApi,
    type UTCTimestamp,
} from "lightweight-charts";
import { formatLocalChartTick, formatLocalChartTime } from "../lib/chart-time";
import type { ChartSyncBus } from "../lib/chart-sync";

export interface OscLine {
    points: Array<{ ts: number; value: number }>;
    color?: string;
    label?: string;
}

export interface OscRefLine {
    value: number;
    color?: string;
    label?: string;
}

export interface OscillatorChartProps {
    /** Optional signed histogram (e.g. MACD bars), colored by sign. */
    histogram?: Array<{ ts: number; value: number }> | null;
    /** Line overlays (MACD DIF/DEA, or the RSI line). */
    lines?: OscLine[];
    /** Horizontal reference levels (RSI 30/70, MACD zero). */
    refLines?: OscRefLine[];
    height?: number;
    /** The full candle timestamp spine (every bar's ts). This pane seeds its
     *  time scale with whitespace at each, so it shares the price chart's EXACT
     *  time points — the panes stay aligned on pan/zoom even where the
     *  indicator series is sparse (warm-up prefix, gaps), and initial fit spans
     *  the whole range rather than only the post-warm-up window. */
    spineTs?: number[] | null;
    /** Fixed value-axis range `[min, max]`, e.g. `[0, 100]` for RSI. Without
     *  it the pane autoscales to the series data, which can clip the ref rails
     *  (price lines don't participate in autoscale). Omit for MACD. */
    yRange?: [number, number] | null;
    /** Pan/zoom. Default true. Set false for a fully static pane. */
    interactive?: boolean;
    /** Shared sync bus so this pane follows the price chart's pan/zoom (and
     *  vice-versa) instead of drifting — the way to keep a stacked view
     *  aligned WHILE interactive. */
    syncBus?: ChartSyncBus | null;
}

// Neutral grey (--color-dim) — the only literal, used when a token can't be
// read (SSR); never a palette hue. See CandleChart.
const NEUTRAL = "#8a98ad";

function readToken(name: string, fallback: string): string {
    if (typeof document === "undefined") return fallback;
    const v = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
    return v || fallback;
}

const asTime = (ts: number) => Math.floor(ts) as UTCTimestamp;
type ChartOptionsArg = NonNullable<Parameters<typeof createChart>[1]>;

function dedupeSorted<T extends { time: UTCTimestamp }>(rows: T[]): T[] {
    const sorted = [...rows].sort((a, b) => (a.time as number) - (b.time as number));
    const out: T[] = [];
    for (const row of sorted) {
        const prev = out[out.length - 1];
        if (prev && prev.time === row.time) out[out.length - 1] = row;
        else out.push(row);
    }
    return out;
}

export function OscillatorChart({
    histogram = null,
    lines = [],
    refLines = [],
    height = 110,
    spineTs = null,
    yRange = null,
    interactive = true,
    syncBus = null,
}: OscillatorChartProps) {
    const wrapRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        const el = wrapRef.current;
        if (!el) return;
        const grid = readToken("--color-rule-soft", NEUTRAL);
        const muted = readToken("--color-muted", NEUTRAL);
        const up = readToken("--color-ok", NEUTRAL);
        const down = readToken("--color-negative", NEUTRAL);
        const ink = readToken("--color-ink", NEUTRAL);
        const accent = readToken("--color-primary", NEUTRAL);

        // Pin the value axis (e.g. RSI 0–100) so the ref rails never clip;
        // ref lines are price lines and don't feed lightweight-charts autoscale.
        const fixedScale = yRange
            ? () => ({ priceRange: { minValue: yRange[0], maxValue: yRange[1] } })
            : undefined;

        const chart = createChart(el, {
            // Explicit width at creation — see CandleChart: a 0-width model
            // silently drops viewport calls until the ResizeObserver fires.
            width: el.clientWidth || undefined,
            height,
            layout: {
                background: { type: ColorType.Solid, color: "transparent" },
                textColor: muted,
                fontFamily: 'var(--mono, ui-monospace, "JetBrains Mono", monospace)',
                attributionLogo: false,
            } as unknown as ChartOptionsArg["layout"],
            grid: {
                vertLines: { color: grid, style: LineStyle.Dotted },
                horzLines: { visible: false },
            },
            rightPriceScale: { borderColor: grid },
            localization: { timeFormatter: formatLocalChartTime },
            timeScale: {
                borderColor: grid,
                timeVisible: true,
                secondsVisible: false,
                tickMarkFormatter: formatLocalChartTick,
            },
            crosshair: { mode: CrosshairMode.Normal },
            handleScroll: interactive,
            handleScale: interactive,
        });
        const hideAttribution = () => {
            for (const node of el.querySelectorAll<HTMLElement>(
                'a[href*="tradingview"], [aria-label*="TradingView"], [title*="TradingView"]',
            )) {
                node.style.display = "none";
            }
        };
        hideAttribution();
        window.setTimeout(hideAttribution, 0);
        const logoObserver =
            typeof MutationObserver !== "undefined" ? new MutationObserver(hideAttribution) : null;
        logoObserver?.observe(el, { childList: true, subtree: true });

        let anchor: ISeriesApi<"Histogram"> | ISeriesApi<"Line"> | null = null;

        if (histogram && histogram.length) {
            const h = chart.addHistogramSeries({
                priceLineVisible: false,
                lastValueVisible: false,
                autoscaleInfoProvider: fixedScale,
            });
            h.setData(
                dedupeSorted(
                    histogram.map((p) => ({
                        time: asTime(p.ts),
                        value: p.value,
                        color: p.value >= 0 ? up : down,
                    })),
                ),
            );
            anchor = h;
        }

        const palette = [ink, accent, muted];
        lines.forEach((ln, i) => {
            if (!ln.points.length) return;
            const s = chart.addLineSeries({
                color: ln.color || palette[i % palette.length],
                lineWidth: 1,
                priceLineVisible: false,
                lastValueVisible: false,
                crosshairMarkerVisible: false,
                title: ln.label,
                autoscaleInfoProvider: fixedScale,
            });
            s.setData(dedupeSorted(ln.points.map((p) => ({ time: asTime(p.ts), value: p.value }))));
            if (!anchor) anchor = s;
        });

        if (anchor) {
            for (const r of refLines) {
                anchor.createPriceLine({
                    price: r.value,
                    color: r.color || muted,
                    lineWidth: 1,
                    lineStyle: LineStyle.Dashed,
                    axisLabelVisible: true,
                    title: r.label || "",
                });
            }
        }

        // Whitespace spacer so the time scale spans the full candle range and
        // this pane lines up under the price chart, even though the indicator
        // series only starts after its warm-up.
        if (spineTs && spineTs.length) {
            // Whitespace at EVERY candle ts so this pane's time scale matches
            // the price chart's exactly — sorted + unique (setData requires
            // strictly-increasing times).
            const seen = new Set<number>();
            const pts: Array<{ time: UTCTimestamp }> = [];
            for (const t of spineTs) {
                const ts = Math.floor(t);
                if (!seen.has(ts)) {
                    seen.add(ts);
                    pts.push({ time: ts as UTCTimestamp });
                }
            }
            const spacer = chart.addLineSeries({
                priceLineVisible: false,
                lastValueVisible: false,
                crosshairMarkerVisible: false,
            });
            spacer.setData(dedupeSorted(pts));
        }

        // Register with the group FIRST: when the price pane already set a
        // shared viewport, snap to it and skip fitContent — the bus also
        // snaps this pane back if its own deferred initial layout fires
        // during the mount-settle window. fitContent only when the pane is
        // standalone / first in the group.
        const detachSync = syncBus?.add(chart);
        if (!syncBus?.current()) chart.timeScale().fitContent();

        const ro =
            typeof ResizeObserver !== "undefined"
                ? new ResizeObserver((entries) => {
                      const w = entries[0]?.contentRect.width ?? 0;
                      if (w > 0) chart.applyOptions({ width: Math.round(w) });
                  })
                : null;
        ro?.observe(el);

        return () => {
            detachSync?.();
            logoObserver?.disconnect();
            ro?.disconnect();
            chart.remove();
        };
    }, [histogram, lines, refLines, height, spineTs, yRange, interactive, syncBus]);

    return (
        <div ref={wrapRef} style={{ width: "100%", height }} role="img" aria-label="indicator" />
    );
}
