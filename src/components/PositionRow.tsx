"use client";

// A single in-management option position row. Five-column grid:
// ticker / chips+numbers+note / mini PnL chart / pct + $. On a narrow
// container it reflows to a stacked card (base.css container query).
//
// PnL up uses the gain accent; down is vermilion. The live mark value
// flashes (motion.css → .tick-up / .tick-down) whenever it changes. Rows
// stagger in when the parent carries data-animate="in" and passes `index`.

import { useEffect, useRef, type ReactNode } from "react";

import { fmtMoney, fmtPct } from "../lib/format";
import { PnLChart, type PnLPoint } from "./PnLChart";

export interface PositionRowProps {
    ticker: string;
    occ: string;
    phaseLabel: string;
    /** Visual tone for the phase chip. */
    phaseTone?: "running" | "tp1" | "arm" | "neutral";
    mode?: string;
    entry: number;
    mark: number;
    qty: number;
    pnl: number;
    dollarPnl?: number;
    age?: string;
    series?: readonly (number | PnLPoint)[];
    privateMode?: boolean;
    privateLabel?: string;
    expanded?: boolean;
    onClick?: () => void;
    /** Optional italic "reason" or note — rendered as a serif pull. */
    note?: string;
    /** Stagger index — set by the list when animating entrance. */
    index?: number;
    labels: {
        entry: string;
        mark: string;
        qty: string;
        age: string;
    };
}

const PHASE_CHIP: Record<NonNullable<PositionRowProps["phaseTone"]>, string> = {
    running: "chip chip--solid",
    tp1: "chip chip--tint-ok",
    arm: "chip chip--tint-warn",
    neutral: "chip",
};

export function PositionRow(p: PositionRowProps) {
    const up = p.pnl >= 0;
    const hidden = p.privateLabel ?? "••••";

    return (
        <div
            className={[
                "grid-cols-position gap-x-4 border-rule-soft py-4 grid items-start border-b",
                p.index !== undefined ? "stagger-item" : "",
                p.onClick ? "cursor-pointer" : "",
            ].join(" ")}
            style={p.index !== undefined ? ({ "--i": p.index } as React.CSSProperties) : undefined}
            role={p.onClick ? "button" : undefined}
            tabIndex={p.onClick ? 0 : undefined}
            aria-expanded={p.onClick ? p.expanded : undefined}
            onClick={p.onClick}
            onKeyDown={(event) => {
                if (!p.onClick) return;
                if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    p.onClick();
                }
            }}
        >
            <div>
                <div className="ticker-display">{p.ticker}</div>
                <div className="caps-value font-code text-muted mt-1 tracking-caps-tight">{p.occ}</div>
                {p.age && (
                    <div className="caps-value text-muted mt-1.5 tracking-caps-tight">
                        {p.labels.age} {p.age}
                    </div>
                )}
            </div>

            <div className="gap-1.5 pt-0.5 flex flex-col min-w-0">
                <div className="gap-1.5 flex flex-wrap">
                    <span className={PHASE_CHIP[p.phaseTone ?? "neutral"]}>{p.phaseLabel}</span>
                    {p.mode && <span className="chip chip--mode">{p.mode}</span>}
                </div>
                <div className="gap-x-3 gap-y-1 font-sans tnum grid grid-cols-2">
                    <Lbl>{p.labels.entry}</Lbl>
                    <Val>{p.privateMode ? hidden : fmtMoney(p.entry)}</Val>
                    <Lbl>{p.labels.mark}</Lbl>
                    <MarkVal raw={p.mark}>{p.privateMode ? hidden : fmtMoney(p.mark)}</MarkVal>
                    <Lbl>{p.labels.qty}</Lbl>
                    <Val>{p.privateMode ? hidden : p.qty}</Val>
                </div>
                {p.note && (
                    <p className="lede text-muted m-0 italic [overflow-wrap:anywhere]">
                        “{p.note}”
                    </p>
                )}
            </div>

            <div>
                {p.series && p.series.length >= 2 && (
                    <PnLChart
                        series={p.series}
                        entry={p.entry}
                        up={up}
                        age={p.age}
                        privateMode={p.privateMode}
                        privateLabel={hidden}
                    />
                )}
            </div>

            <div
                className={[
                    "pt-1 font-sans font-semibold tnum text-pnl text-right leading-none",
                    up ? "text-gain" : "text-negative",
                ].join(" ")}
            >
                <>
                    <span aria-hidden="true" className="text-num-lg">
                        {up ? "▲ " : "▼ "}
                    </span>
                    {fmtPct(p.pnl / 100, 1)}
                </>
                {!p.privateMode && p.dollarPnl !== undefined && (
                    <div className="mt-1 font-sans font-normal text-mini text-muted tnum tracking-caps-tight">
                        {p.dollarPnl >= 0 ? "+" : "−"}${Math.abs(p.dollarPnl).toLocaleString()}
                    </div>
                )}
            </div>
        </div>
    );
}

function Lbl({ children }: { children: ReactNode }) {
    return <span className="caps-meta self-end">{children}</span>;
}
function Val({ children }: { children: ReactNode }) {
    return (
        <span className="font-sans font-medium text-num-lg text-ink tnum text-right">
            {children}
        </span>
    );
}

/** Mark value that flashes gain/loss when the underlying number changes. */
function MarkVal({ raw, children }: { raw: number; children: ReactNode }) {
    const ref = useRef<HTMLSpanElement>(null);
    const prev = useRef(raw);
    useEffect(() => {
        if (prev.current !== raw && ref.current) {
            const el = ref.current;
            const cls = raw >= prev.current ? "tick-up" : "tick-down";
            el.classList.remove("tick-up", "tick-down");
            void el.offsetWidth; // restart the animation
            el.classList.add(cls);
        }
        prev.current = raw;
    }, [raw]);
    return (
        <span ref={ref} className="font-sans font-medium text-num-lg text-ink tnum text-right">
            {children}
        </span>
    );
}
