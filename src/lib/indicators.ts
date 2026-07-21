// Pure technical-indicator math (EMA / MACD / RSI) over a close-price
// series — a TypeScript port of the Rust `sunflower::indicators` module
// so the chart overlays match the engine's semantics (TA-Lib / Appel).
//
// Every output array is the same length as the input, front-padded with
// NaN until its first-valid index (mirrors TA-Lib). Pass closes
// oldest-to-newest. All math is f64-equivalent (JS number).

export const MACD_FAST = 12;
export const MACD_SLOW = 26;
export const MACD_SIGNAL = 9;
export const RSI_PERIOD = 14;

/** SMA-seeded EMA. `out[period-1]` is the mean of the first `period`
 *  inputs; earlier indices are NaN; later indices follow the EMA
 *  recurrence with α = 2/(period+1). */
export function emaSmaSeed(x: number[], period: number): number[] {
    const out = new Array<number>(x.length).fill(NaN);
    if (period <= 0 || x.length < period) return out;
    const alpha = 2 / (period + 1);
    const seed = x.slice(0, period).reduce((a, b) => a + b, 0) / period;
    out[period - 1] = seed;
    let prev = seed;
    x.slice(period).forEach((v, i) => {
        prev = alpha * v + (1 - alpha) * prev;
        out[period + i] = prev;
    });
    return out;
}

export interface MacdResult {
    /** DIF = EMA(fast) − EMA(slow). First valid at index slow−1. */
    dif: number[];
    /** DEA / signal = SMA-seeded EMA(signal) of the valid DIF tail. */
    dea: number[];
    /** Histogram = DIF − DEA (no ×2). */
    hist: number[];
}

/** Classic Appel MACD. Mirrors `talib.MACD(close, fast, slow, signal)`. */
export function macd(
    close: number[],
    fast = MACD_FAST,
    slow = MACD_SLOW,
    signal = MACD_SIGNAL,
): MacdResult {
    const n = close.length;
    const emaFast = emaSmaSeed(close, fast);
    const emaSlow = emaSmaSeed(close, slow);
    // emaFast/emaSlow/close all have length n, so the paired lookup below
    // is in-bounds; `?? NaN` keeps the NaN-padding contract regardless.
    const dif = emaFast.map((f, t) => {
        const s = emaSlow[t] ?? NaN;
        return Number.isFinite(f) && Number.isFinite(s) ? f - s : NaN;
    });
    // DEA = SMA-seeded EMA over the valid DIF tail (from index slow−1).
    const dea = new Array<number>(n).fill(NaN);
    const firstDif = Math.max(0, slow - 1);
    if (n > firstDif) {
        const tail = dif.slice(firstDif);
        emaSmaSeed(tail, signal).forEach((v, i) => {
            dea[firstDif + i] = v;
        });
    }
    const hist = dif.map((d, t) => {
        const s = dea[t] ?? NaN;
        return Number.isFinite(d) && Number.isFinite(s) ? d - s : NaN;
    });
    return { dif, dea, hist };
}

/** Wilder's RSI (RMA smoothing, α = 1/period). `out[period]` is the
 *  first valid value; earlier indices are NaN. No losses ⇒ 100; no
 *  gains ⇒ 0. */
export function rsiWilder(close: number[], period = RSI_PERIOD): number[] {
    const n = close.length;
    const out = new Array<number>(n).fill(NaN);
    if (period <= 0 || n <= period) return out;
    // deltas[i] = close[i+1] − close[i] (length n−1 ≥ period).
    const deltas: number[] = [];
    for (const [i, c] of close.entries()) {
        const prev = close[i - 1];
        if (prev !== undefined) deltas.push(c - prev);
    }
    let gain = 0;
    let loss = 0;
    for (const d of deltas.slice(0, period)) {
        if (d > 0) gain += d;
        else loss += -d;
    }
    let avgGain = gain / period;
    let avgLoss = loss / period;
    out[period] = rsiFromAvgs(avgGain, avgLoss);
    deltas.slice(period).forEach((d, i) => {
        const g = d > 0 ? d : 0;
        const l = d < 0 ? -d : 0;
        avgGain = (avgGain * (period - 1) + g) / period;
        avgLoss = (avgLoss * (period - 1) + l) / period;
        out[period + 1 + i] = rsiFromAvgs(avgGain, avgLoss);
    });
    return out;
}

function rsiFromAvgs(avgGain: number, avgLoss: number): number {
    if (avgLoss === 0) return 100;
    return (100 * avgGain) / (avgGain + avgLoss);
}
