"use client";

// CandleChart — interactive candlestick chart for a single
// option contract. Backed by TradingView's lightweight-charts (Apache
// 2.0): native pan (drag), wheel/pinch zoom, crosshair with OHLC
// readout, an EMA overlay, a stop-loss price line, arbitrary
// horizontal/price reference lines, and event markers (entry, add,
// exit, trim, now, sl).
//
// Replaces the old hand-rolled SVG implementation. Data is 1-second
// OHLC bars; lightweight-charts handles large series + zooming itself,
// so we hand it the raw bars (sorted, de-duped) rather than
// pre-aggregating. Colours are read from CSS theme tokens and re-applied
// when the OS flips dark mode or the page sets data-theme on <html>, so
// the chart matches the surrounding newsprint/emerald palette.

import {
    ColorType,
    CrosshairMode,
    LineStyle,
    createChart,
    type AutoscaleInfoProvider,
    type IChartApi,
    type ISeriesApi,
    type IPriceLine,
    type LogicalRange,
    type SeriesMarker,
    type Time,
    type UTCTimestamp,
} from "lightweight-charts";
import { useEffect, useRef } from "react";
import { formatLocalChartTick, formatLocalChartTime } from "../lib/chart-time";
import type { ChartSyncBus } from "../lib/chart-sync";

/** Price-series render style. `candles`/`bar` use OHLC; `line`/`area` use close. */
export type PriceSeriesType = "candles" | "bar" | "line" | "area";

export interface CandleBar {
    ts: number; // epoch seconds
    o: number;
    h: number;
    l: number;
    c: number;
    v: number;
}

export type CandleMarkerKind = "entry" | "add" | "exit" | "trim" | "now" | "sl" | "snapshot";

export interface CandleMarker {
    ts: number; // epoch seconds
    kind: CandleMarkerKind;
    label?: string;
    price?: number | null;
    /** Full text shown in a hover tooltip — the on-chart `label` can be
     *  thinned for density while the tooltip keeps the exact reading. */
    tooltip?: string;
    /** The event the enclosing card is about: drawn bigger and always
     *  labeled, but in its kind's own color — a second color would read as a
     *  second event on top of the semantic marker. */
    focus?: boolean;
}

export interface CandleExtraLine {
    /** Constant horizontal price level. */
    price?: number;
    /** OR a time-series polyline of {ts, value} points. */
    points?: Array<{ ts: number; value: number }>;
    color?: string;
    label?: string;
    dashed?: boolean;
}

export interface CandleChartProps {
    bars: CandleBar[];
    markers?: CandleMarker[];
    height?: number;
    emaSeries?: Array<{ ts: number; value: number }> | null;
    emaLabel?: string;
    slLevel?: number | null;
    slLabel?: string;
    extraLines?: CandleExtraLine[];
    /** Changes when the caller intentionally wants to reset the visible range. */
    viewResetKey?: string | number;
    /** Initial viewport as a logical bar-index range (fractional indices;
     *  negative = whitespace left of the first bar, > bars.length−1 = right
     *  margin). Applied whenever the view resets (first mount / `viewResetKey`
     *  change) instead of `fitContent()`. Omit to fit the full range. */
    initialRange?: { from: number; to: number } | null;
    /** Pan/zoom. Default true. Set false for a fully static chart. In a
     *  stacked view keep it interactive but pass `syncBus` so the panes move
     *  together instead of drifting apart. The crosshair always works. */
    interactive?: boolean;
    /** Shared sync bus so a stacked view's panes follow this chart's pan/zoom. */
    syncBus?: ChartSyncBus | null;
    /** Price render style — candlesticks (default), bars, line, or area. */
    seriesType?: PriceSeriesType;
    /** Draw the volume histogram. Defaults to true. */
    showVolume?: boolean;
    /** Accessible name for the chart image. */
    ariaLabel?: string;
}

// Canvas colours must be resolved strings, so every read needs a literal
// last resort for SSR / a missing token. It is the neutral grey (--color-dim),
// never a palette colour — a wrong-but-neutral stroke beats a wrong-hued one.
const NEUTRAL = "#8a98ad";

function readToken(name: string, fallback: string): string {
    if (typeof document === "undefined") return fallback;
    const v = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
    return v || fallback;
}

// lightweight-charts draws series on a canvas and can't resolve CSS custom
// properties, so a caller passing `var(--ema-9)` would silently get no color.
// Resolve a `var(--token[, fallback])` string to its computed value; pass any
// other color (hex/rgb) through unchanged.
function resolveColor(color: string | undefined, fallback: string): string {
    if (!color) return fallback;
    const m = color.trim().match(/^var\(\s*(--[\w-]+)\s*(?:,\s*(.+?))?\s*\)$/);
    return m ? readToken(m[1]!, (m[2] ?? fallback).trim()) : color;
}

interface Theme {
    up: string;
    down: string;
    ink: string;
    muted: string;
    grid: string;
    paper: string;
    ema: string;
    sl: string;
}

function readTheme(): Theme {
    return {
        up: readToken("--color-ok", NEUTRAL),
        down: readToken("--color-negative", NEUTRAL),
        ink: readToken("--color-ink", NEUTRAL),
        muted: readToken("--color-muted", NEUTRAL),
        grid: readToken("--color-rule-soft", NEUTRAL),
        paper: readToken("--color-paper", NEUTRAL),
        // The EMA overlay rides the skin's EMA-9 stroke where one exists
        // (the operator skin), else the brand accent.
        ema: readToken("--ema-9", readToken("--color-primary", NEUTRAL)),
        sl: readToken("--color-negative", NEUTRAL),
    };
}

const asTime = (ts: number) => Math.floor(ts) as UTCTimestamp;
type ChartOptionsArg = NonNullable<Parameters<typeof createChart>[1]>;
const EMPTY_MARKERS: CandleMarker[] = [];
const EMPTY_EXTRA_LINES: CandleExtraLine[] = [];

/** Sort ascending by time and drop duplicate timestamps (keep last) —
 *  lightweight-charts requires strictly increasing, unique times. */
function dedupeSorted<T extends { time: UTCTimestamp }>(rows: T[]): T[] {
    const sorted = [...rows].sort((a, b) => (a.time as number) - (b.time as number));
    const out: T[] = [];
    for (const r of sorted) {
        const prev = out[out.length - 1];
        if (prev && prev.time === r.time) out[out.length - 1] = r;
        else out.push(r);
    }
    return out;
}

function markerStyle(
    kind: CandleMarkerKind,
    theme: Theme,
): { position: SeriesMarker<Time>["position"]; shape: SeriesMarker<Time>["shape"]; color: string } {
    switch (kind) {
        case "entry":
            return { position: "belowBar", shape: "arrowUp", color: theme.up };
        case "add":
            return { position: "belowBar", shape: "arrowUp", color: theme.ema };
        case "exit":
            return { position: "aboveBar", shape: "arrowDown", color: theme.down };
        case "trim":
            return {
                position: "aboveBar",
                shape: "arrowDown",
                color: readToken("--color-ochre", NEUTRAL),
            };
        case "now":
            return { position: "inBar", shape: "circle", color: theme.ink };
        case "sl":
            return { position: "aboveBar", shape: "square", color: theme.sl };
        case "snapshot":
            // Passive P/L snapshot (not a trade action): a quiet dot.
            return { position: "aboveBar", shape: "circle", color: theme.muted };
    }
}

export function CandleChart({
    bars,
    markers = EMPTY_MARKERS,
    height = 320,
    emaSeries = null,
    emaLabel = "EMA",
    slLevel = null,
    slLabel = "SL",
    extraLines = EMPTY_EXTRA_LINES,
    viewResetKey,
    initialRange = null,
    interactive = true,
    syncBus = null,
    seriesType = "candles",
    showVolume = true,
    ariaLabel = "price chart",
}: CandleChartProps) {
    const wrapRef = useRef<HTMLDivElement | null>(null);
    const chartRef = useRef<IChartApi | null>(null);
    const candleRef = useRef<ISeriesApi<"Candlestick" | "Bar" | "Line" | "Area"> | null>(null);
    const volRef = useRef<ISeriesApi<"Histogram"> | null>(null);
    const emaRef = useRef<ISeriesApi<"Line"> | null>(null);
    const extraRef = useRef<ISeriesApi<"Line">[]>([]);
    const priceLinesRef = useRef<IPriceLine[]>([]);
    const fittedRef = useRef(false);
    const fittedResetKeyRef = useRef<string | number | undefined>(undefined);
    const rangeGenerationRef = useRef(0);
    // Marker-id → tooltip text for the crosshair hover handler (set by the
    // data effect, read by the build effect's subscription).
    const markerTipsRef = useRef<Map<string, string>>(new Map());
    // Whether any markers are set (set by the data effect, read by the build
    // effect's autoscale provider): a markerless chart must not reserve
    // marker headroom.
    const hasMarkersRef = useRef(false);

    // Build the chart once.
    useEffect(() => {
        const el = wrapRef.current;
        if (!el) return;
        const theme = readTheme();
        const layoutOptions = {
            background: { type: ColorType.Solid, color: "transparent" },
            textColor: theme.muted,
            fontFamily: 'var(--mono, ui-monospace, "JetBrains Mono", monospace)',
            attributionLogo: false,
        } as unknown as ChartOptionsArg["layout"];
        const chart = createChart(el, {
            // Size the chart NOW: without an explicit width the internal model
            // stays 0 until the ResizeObserver's first (async) callback, and
            // every viewport call issued by the data effect before that —
            // fitContent or an explicit range — is silently dropped, leaving
            // the default right-crammed view. The observer still handles
            // later resizes.
            width: el.clientWidth || undefined,
            height,
            layout: layoutOptions,
            grid: {
                vertLines: { color: theme.grid, style: LineStyle.Dotted },
                horzLines: { color: theme.grid, style: LineStyle.Dotted },
            },
            rightPriceScale: { borderColor: theme.grid },
            localization: { timeFormatter: formatLocalChartTime },
            timeScale: {
                borderColor: theme.grid,
                timeVisible: true,
                secondsVisible: true,
                tickMarkFormatter: formatLocalChartTick,
            },
            crosshair: { mode: CrosshairMode.Normal },
            handleScroll: interactive,
            handleScale: interactive,
        });
        chartRef.current = chart;
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

        // Marker autoscale margins grow with bar spacing (NOT with the
        // per-marker `size`), so a wide fitted viewport with a few arrow
        // markers squashes the candles into a sliver — the library reserves
        // 100px+ of pane for the arrows. Keep the data-driven price range but
        // pin the margins to sane pixels; a marker at the extreme bar may
        // slightly overlap the pane edge, which reads fine. Without markers
        // there is nothing to reserve headroom for, and on short panes the
        // pixel caps shrink proportionally so a mini chart keeps its candles
        // instead of its padding (`height` is the container, so the ratio is
        // approximate — that's fine for headroom).
        const fixedMarkerMargins: AutoscaleInfoProvider = (orig) => {
            const info = orig();
            if (!info || !hasMarkersRef.current) return info;
            // Enough headroom for a focused (~2x) marker plus its label line.
            return {
                priceRange: info.priceRange,
                margins: {
                    above: Math.min(34, Math.round(height * 0.16)),
                    below: Math.min(22, Math.round(height * 0.1)),
                },
            };
        };
        const candle: ISeriesApi<"Candlestick" | "Bar" | "Line" | "Area"> =
            seriesType === "line"
                ? chart.addLineSeries({
                      color: theme.ink,
                      lineWidth: 2,
                      autoscaleInfoProvider: fixedMarkerMargins,
                  })
                : seriesType === "area"
                  ? chart.addAreaSeries({
                        lineColor: theme.ink,
                        topColor: theme.up,
                        bottomColor: "transparent",
                        lineWidth: 2,
                        autoscaleInfoProvider: fixedMarkerMargins,
                    })
                  : seriesType === "bar"
                    ? chart.addBarSeries({
                          upColor: theme.up,
                          downColor: theme.down,
                          autoscaleInfoProvider: fixedMarkerMargins,
                      })
                    : chart.addCandlestickSeries({
                          upColor: theme.up,
                          downColor: theme.down,
                          borderUpColor: theme.up,
                          borderDownColor: theme.down,
                          wickUpColor: theme.up,
                          wickDownColor: theme.down,
                          autoscaleInfoProvider: fixedMarkerMargins,
                      });
        candleRef.current = candle;

        if (showVolume) {
            const vol = chart.addHistogramSeries({
                priceScaleId: "vol",
                priceFormat: { type: "volume" },
                priceLineVisible: false,
                lastValueVisible: false,
            });
            vol.priceScale().applyOptions({ scaleMargins: { top: 0.82, bottom: 0 } });
            volRef.current = vol;
        } else {
            volRef.current = null;
        }

        const ema = chart.addLineSeries({
            color: theme.ema,
            lineWidth: 2,
            lineStyle: LineStyle.Dashed,
            priceLineVisible: false,
            lastValueVisible: false,
            crosshairMarkerVisible: false,
            title: emaLabel,
        });
        emaRef.current = ema;

        const ro =
            typeof ResizeObserver !== "undefined"
                ? new ResizeObserver((entries) => {
                      const w = entries[0]?.contentRect.width ?? 0;
                      if (w > 0) chart.applyOptions({ width: Math.round(w) });
                  })
                : null;
        ro?.observe(el);

        // Re-theme on dark-mode / data-theme change.
        const applyTheme = () => {
            const t = readTheme();
            chart.applyOptions({
                layout: { textColor: t.muted },
                grid: {
                    vertLines: { color: t.grid, style: LineStyle.Dotted },
                    horzLines: { color: t.grid, style: LineStyle.Dotted },
                },
                rightPriceScale: { borderColor: t.grid },
                timeScale: { borderColor: t.grid, tickMarkFormatter: formatLocalChartTick },
            });
            if (seriesType === "candles") {
                (candle as ISeriesApi<"Candlestick">).applyOptions({
                    upColor: t.up,
                    downColor: t.down,
                    borderUpColor: t.up,
                    borderDownColor: t.down,
                    wickUpColor: t.up,
                    wickDownColor: t.down,
                });
            } else if (seriesType === "bar") {
                (candle as ISeriesApi<"Bar">).applyOptions({ upColor: t.up, downColor: t.down });
            } else if (seriesType === "line") {
                (candle as ISeriesApi<"Line">).applyOptions({ color: t.ink });
            } else {
                (candle as ISeriesApi<"Area">).applyOptions({ lineColor: t.ink, topColor: t.up });
            }
            ema.applyOptions({ color: t.ema });
        };
        const mq =
            typeof window !== "undefined"
                ? window.matchMedia("(prefers-color-scheme: dark)")
                : null;
        mq?.addEventListener("change", applyTheme);
        const mo =
            typeof MutationObserver !== "undefined" ? new MutationObserver(applyTheme) : null;
        if (mo && typeof document !== "undefined") {
            mo.observe(document.documentElement, {
                attributes: true,
                attributeFilter: ["data-theme"],
            });
        }

        const detachSync = syncBus?.add(chart);

        // Marker hover tooltip: lightweight-charts reports the hovered
        // marker's `id` on crosshair moves; surface its full text in a small
        // floating tag (the on-chart labels are thinned for density).
        el.style.position = "relative";
        const tip = document.createElement("div");
        tip.style.cssText =
            "position:absolute;display:none;z-index:3;pointer-events:none;" +
            "padding:1px 6px;white-space:nowrap;" +
            `font-family:var(--font-code, ui-monospace, monospace);font-size:0.625rem;`;
        el.appendChild(tip);
        const onCrosshair = (param: { hoveredObjectId?: unknown; point?: { x: number; y: number } }) => {
            const id = typeof param.hoveredObjectId === "string" ? param.hoveredObjectId : null;
            const text = id != null ? markerTipsRef.current.get(id) : undefined;
            if (!text || !param.point) {
                tip.style.display = "none";
                return;
            }
            const t = readTheme();
            tip.style.background = t.paper;
            tip.style.color = t.ink;
            tip.style.border = `1px solid ${t.ink}`;
            tip.textContent = text;
            tip.style.display = "block";
            const w = el.clientWidth;
            tip.style.left = `${Math.min(param.point.x + 10, Math.max(0, w - tip.offsetWidth - 4))}px`;
            tip.style.top = `${Math.max(0, param.point.y - 26)}px`;
        };
        chart.subscribeCrosshairMove(onCrosshair);

        return () => {
            chart.unsubscribeCrosshairMove(onCrosshair);
            tip.remove();
            detachSync?.();
            ro?.disconnect();
            logoObserver?.disconnect();
            mq?.removeEventListener("change", applyTheme);
            mo?.disconnect();
            chart.remove();
            chartRef.current = null;
            candleRef.current = null;
            volRef.current = null;
            emaRef.current = null;
            extraRef.current = [];
            priceLinesRef.current = [];
            fittedRef.current = false;
            // Keep fittedResetKeyRef across an in-place rebuild (series-type
            // switch) so the data effect can tell "same position, restore the
            // synced viewport" from "new position, fit full range".
        };
        // height/emaLabel only affect first build; data flows via the
        // effect below. Rebuilding on every prop would drop the viewport.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [height, interactive, seriesType, showVolume, syncBus]);

    // Push data on every prop change.
    useEffect(() => {
        const generation = ++rangeGenerationRef.current;
        let rangeFrame: number | null = null;
        const chart = chartRef.current;
        const candle = candleRef.current;
        const vol = volRef.current;
        const ema = emaRef.current;
        if (!chart || !candle || !ema) return;
        const theme = readTheme();
        // A data REFRESH for the same position (same reset key, already
        // fitted) must not move the user's viewport: capture it before the
        // setData calls below and re-assert it after — series replacement can
        // otherwise shift the visible range.
        const keepRange =
            fittedRef.current && fittedResetKeyRef.current === viewResetKey
                ? chart.timeScale().getVisibleLogicalRange()
                : null;

        if (seriesType === "line" || seriesType === "area") {
            (candle as ISeriesApi<"Line">).setData(
                dedupeSorted(bars.map((b) => ({ time: asTime(b.ts), value: b.c }))),
            );
        } else {
            (candle as ISeriesApi<"Candlestick">).setData(
                dedupeSorted(
                    bars.map((b) => ({
                        time: asTime(b.ts),
                        open: b.o,
                        high: b.h,
                        low: b.l,
                        close: b.c,
                    })),
                ),
            );
        }

        vol?.setData(
            dedupeSorted(
                bars.map((b) => ({
                    time: asTime(b.ts),
                    value: b.v,
                    color: b.c >= b.o ? theme.up : theme.down,
                })),
            ),
        );

        ema.setData(
            emaSeries && emaSeries.length
                ? dedupeSorted(emaSeries.map((p) => ({ time: asTime(p.ts), value: p.value })))
                : [],
        );
        ema.applyOptions({ title: emaLabel });

        // Rebuild extra time-series line overlays.
        for (const s of extraRef.current) chart.removeSeries(s);
        extraRef.current = [];
        for (const ln of extraLines) {
            if (!ln.points || ln.points.length === 0) continue;
            const s = chart.addLineSeries({
                color: resolveColor(ln.color, theme.muted),
                lineWidth: 1,
                lineStyle: ln.dashed ? LineStyle.Dashed : LineStyle.Solid,
                priceLineVisible: false,
                lastValueVisible: false,
                crosshairMarkerVisible: false,
                title: ln.label,
            });
            s.setData(dedupeSorted(ln.points.map((p) => ({ time: asTime(p.ts), value: p.value }))));
            extraRef.current.push(s);
        }

        // Rebuild price lines (SL + constant-price extra lines).
        for (const pl of priceLinesRef.current) candle.removePriceLine(pl);
        priceLinesRef.current = [];
        if (slLevel != null) {
            priceLinesRef.current.push(
                candle.createPriceLine({
                    price: slLevel,
                    color: theme.sl,
                    lineWidth: 1,
                    lineStyle: LineStyle.Dashed,
                    axisLabelVisible: true,
                    title: slLabel,
                }),
            );
        }
        for (const ln of extraLines) {
            if (ln.price == null) continue;
            priceLinesRef.current.push(
                candle.createPriceLine({
                    price: ln.price,
                    color: resolveColor(ln.color, theme.muted),
                    lineWidth: 1,
                    lineStyle: ln.dashed ? LineStyle.Dashed : LineStyle.Solid,
                    axisLabelVisible: true,
                    title: ln.label || "",
                }),
            );
        }

        // Event markers.
        const sorted = [...markers].sort((a, b) => a.ts - b.ts);
        hasMarkersRef.current = sorted.length > 0;
        markerTipsRef.current = new Map(
            sorted.flatMap((m, i) => (m.tooltip ? [[`m${i}`, m.tooltip] as const] : [])),
        );
        candle.setMarkers(
            sorted.map((m, i) => {
                const s = markerStyle(m.kind, theme);
                return {
                    id: `m${i}`,
                    time: asTime(m.ts),
                    position: s.position,
                    shape: s.shape,
                    color: s.color,
                    text: m.label ?? "",
                    // Fixed small size: the library scales markers with bar
                    // spacing, so a wide fitted viewport otherwise grows the
                    // arrows huge AND squashes the candles (marker pixel
                    // margins participate in the price autoscale). The focused
                    // marker gets ~2x plus its "current" label instead of a
                    // different color.
                    size: m.focus ? 1.2 : m.kind === "snapshot" ? 0.35 : 0.6,
                };
            }),
        );

        // Viewport writes cannot be fire-and-forget: a range set in the same
        // tick as `setData` is dropped (the scale hasn't assimilated the data
        // yet), and the chart's own deferred scroll-to-latest layout pass
        // lands a frame later and overrides it (this is why a bare
        // `fitContent()` used to leave the default right-crammed view). So
        // assert through the sync bus (group-wide, echo-suppressed) and retry
        // on animation frames until the range actually sticks.
        const assertRange = (get: () => { from: number; to: number } | null) => {
            let tries = 0;
            const apply = () => {
                const r = get();
                if (!r) return;
                if (syncBus) {
                    syncBus.setViewport(r as unknown as LogicalRange);
                } else {
                    try {
                        chart.timeScale().setVisibleLogicalRange(r);
                    } catch {
                        /* range outside the data — retry below */
                    }
                }
                const got = chart.timeScale().getVisibleLogicalRange();
                const landed =
                    got && Math.abs(got.from - r.from) < 0.5 && Math.abs(got.to - r.to) < 0.5;
                // ~0.5s of retries: inside awkward containers (a table cell in
                // a scroller that grows a scrollbar as data lands) the chart's
                // width can take tens of frames to stabilise, and every range
                // write before that is dropped.
                if (!landed && ++tries < 30) {
                    rangeFrame = requestAnimationFrame(() => {
                        if (
                            chartRef.current === chart &&
                            rangeGenerationRef.current === generation
                        ) {
                            apply();
                        }
                    });
                }
            };
            apply();
        };
        if (!fittedRef.current || fittedResetKeyRef.current !== viewResetKey) {
            // A rebuild of the SAME position (a series-type switch keeps the
            // reset key) restores the synced viewport instead of snapping to
            // full range; a new position (changed key) or first mount fits.
            const saved =
                fittedResetKeyRef.current === viewResetKey ? (syncBus?.current() ?? null) : null;
            if (saved) {
                assertRange(() => saved);
            } else if (initialRange) {
                assertRange(() => initialRange);
            } else if (bars.length > 0) {
                // Full-range fit, expressed explicitly (see assertRange note).
                assertRange(() => ({ from: -0.5, to: bars.length - 0.5 }));
            }
            fittedRef.current = true;
            fittedResetKeyRef.current = viewResetKey;
        } else if (keepRange) {
            assertRange(() => keepRange);
        }
        return () => {
            rangeGenerationRef.current += 1;
            if (rangeFrame != null) cancelAnimationFrame(rangeFrame);
        };
    }, [bars, markers, emaSeries, emaLabel, slLevel, slLabel, extraLines, viewResetKey, initialRange, seriesType, syncBus]);

    return (
        <div ref={wrapRef} style={{ width: "100%", height }} role="img" aria-label={ariaLabel} />
    );
}
