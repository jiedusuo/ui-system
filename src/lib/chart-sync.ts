// A sync bus for STACKED charts (a CandleChart over its MACD/RSI/PnL
// OscillatorChart panes). lightweight-charts v4 has no native multi-pane, so
// each pane is its own chart instance with an independent time scale; without
// this, panning/zooming the price chart would leave the oscillator panes
// behind. Panes here follow each other's visible LOGICAL range (bar-index
// based) — which is exact because every pane is seeded with the SAME candle
// timestamp spine (see OscillatorChart `spineTs`), so a given logical index is
// the same bar in every pane.
//
// Echo suppression is by value, NOT a synchronous flag: lightweight-charts
// applies `setVisibleLogicalRange()` on a LATER frame, so a boolean guard
// would already be cleared when the follower re-fires — and during a rapid
// drag a follower can echo an EARLIER programmatic range after the source has
// already moved on. So each chart keeps a small queue of the ranges we set on
// it programmatically; when its handler fires we drop it if it matches any
// queued range (a self-echo) and only propagate a genuinely new user range.

import type { IChartApi, LogicalRange } from "lightweight-charts";

export interface ChartSyncBus {
    /** Register a chart; returns an unregister cleanup. */
    add(chart: IChartApi): () => void;
    /** The group's current shared viewport (logical range), or null before any
     *  pan/zoom. A chart REBUILT in place (e.g. a series-type switch) reads
     *  this to restore the viewport instead of snapping back to full range. */
    current(): LogicalRange | null;
    /** Authoritative programmatic viewport for the WHOLE group (initial fit,
     *  refresh restore). Recorded as `current` and applied to every pane with
     *  echo suppression — unlike a raw `setVisibleLogicalRange`, it is never
     *  mistaken for a user pan. */
    setViewport(range: LogicalRange): void;
}

// Logical bounds are fractional bar indices; an echo lands within well under a
// bar of the value we set, so a small epsilon distinguishes it from a real pan.
const EPS = 0.01;
// Bound the per-chart pending queue so a programmatic set that never echoes
// (e.g. a no-op range equal to the current one) can't accumulate unboundedly.
const MAX_PENDING = 8;
function near(a: LogicalRange, b: LogicalRange): boolean {
    return Math.abs(a.from - b.from) < EPS && Math.abs(a.to - b.to) < EPS;
}

// A freshly-(re)built chart emits its OWN default layout pass (setData's
// deferred scroll-to-latest) as a visible-range change a frame or two after
// mount. Those events are not user pans: within this window after `add()` a
// chart's range changes don't update/propagate the group viewport — instead
// the chart is snapped BACK to it. Real pans start after mount-settle in
// practice; a pan inside the window merely loses to the group viewport once.
const SETTLE_MS = 400;

export function createChartSyncBus(): ChartSyncBus {
    const charts = new Set<IChartApi>();
    // Per chart: ranges we set on it programmatically and are still waiting to
    // hear echoed back (matched against ALL of them, since a follower echo can
    // arrive several frames — and several source updates — late).
    const pending = new WeakMap<IChartApi, LogicalRange[]>();
    const settleUntil = new WeakMap<IChartApi, number>();
    let current: LogicalRange | null = null;

    const setProgrammatic = (chart: IChartApi, range: LogicalRange) => {
        const list = pending.get(chart) ?? [];
        list.push(range);
        if (list.length > MAX_PENDING) list.shift();
        pending.set(chart, list);
        try {
            chart.timeScale().setVisibleLogicalRange(range);
        } catch {
            // Range outside this pane's data yet — ignore.
        }
    };

    return {
        add(chart) {
            const ts = chart.timeScale();
            settleUntil.set(chart, performance.now() + SETTLE_MS);
            const handler = (range: LogicalRange | null) => {
                if (!range) return;
                const list = pending.get(chart);
                if (list?.length) {
                    const idx = list.findIndex((r) => near(r, range));
                    if (idx >= 0) {
                        // Self-echo — drop it and any older (now-moot) ones.
                        list.splice(0, idx + 1);
                        return;
                    }
                }
                if (performance.now() < (settleUntil.get(chart) ?? 0)) {
                    // Mount-settle noise (the chart's own default layout), not
                    // a pan — snap back to the group viewport instead of
                    // hijacking it.
                    if (current && !near(current, range)) setProgrammatic(chart, current);
                    return;
                }
                // Genuinely user-driven — propagate to the other panes.
                current = range;
                for (const other of charts) {
                    if (other !== chart) setProgrammatic(other, range);
                }
            };
            ts.subscribeVisibleLogicalRangeChange(handler);
            charts.add(chart);
            // Snap a freshly-registered pane to the group's current viewport.
            if (current) setProgrammatic(chart, current);
            return () => {
                ts.unsubscribeVisibleLogicalRangeChange(handler);
                charts.delete(chart);
                pending.delete(chart);
                settleUntil.delete(chart);
            };
        },
        current() {
            return current;
        },
        setViewport(range) {
            current = range;
            for (const chart of charts) setProgrammatic(chart, range);
        },
    };
}
