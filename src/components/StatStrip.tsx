import type { LucideIcon } from "lucide-react";
import { cva } from "class-variance-authority";

import { cn } from "../lib/cn";

export interface StatCell {
    /** Chinese micro-label (e.g. 采集器在线). Never uppercased — see the note below. */
    label: string;
    /** The headline number/word. Rendered tabular so a strip of cells never jitters. */
    value: string | number;
    /** Trailing unit ("条" / "%" / "ms"), set small and dim next to the value. */
    unit?: string;
    /** Colours the value only. Omit it when the number is merely a number — a
     * tone here is a claim that the operator must act. */
    tone?: "ok" | "warn" | "err";
    /** One line of context under the value (e.g. 「死信 0」). */
    sub?: string;
    /** A lucide component, passed in by the caller: `icon={Gauge}`. */
    icon?: LucideIcon;
}

export interface StatStripProps {
    cells: readonly StatCell[];
    className?: string;
}

const statValue = cva(
    "font-sans text-pnl leading-tight font-extrabold [font-variant-numeric:tabular-nums]",
    {
        variants: {
            tone: {
                ok: "text-ok-2",
                warn: "text-ochre",
                err: "text-negative",
            },
        },
    },
);

/**
 * The operator-density metric strip: one hairline-divided card, N equal cells,
 * each a micro-label over a big tabular number (optional unit, sub-line, and
 * lucide icon).
 *
 * Use it where a page needs a 60-second read of "is anything backed up" — it
 * replaces the row of big KPI cards. Three to five cells; past that the strip
 * wraps and stops being scannable. Cells are equal-weight by construction, so
 * do not smuggle a hierarchy in by making one cell's `value` a sentence.
 *
 * Hidden contract: `tone` colours ONLY the value, and it is semantic status
 * (ok / warn / err), never the brand accent — an uncoloured value is the normal
 * case. `label` is Chinese, so it carries the micro-label size, tracking and
 * colour but NOT `uppercase` (uppercase is meaningless on Chinese and breaks
 * the rhythm). The icon is a component, not a name: `icon={Gauge}`.
 */
export function StatStrip({ cells, className }: StatStripProps) {
    return (
        <div
            className={cn(
                "border-rule-soft bg-paper flex flex-wrap overflow-hidden rounded-[var(--radius-surface)] border shadow-[var(--elevation-card)]",
                className,
            )}
        >
            {cells.map((cell, i) => (
                <div
                    key={i}
                    className="basis-0 gap-0.5 border-rule-soft px-4 py-3 flex min-w-[9rem] flex-1 flex-col border-r last:border-r-0"
                >
                    <span className="gap-1.5 font-sans text-label font-semibold tracking-caps text-muted flex items-center">
                        {cell.icon && <cell.icon className="size-3.5" aria-hidden />}
                        {cell.label}
                    </span>
                    <span className={statValue({ tone: cell.tone })}>
                        {cell.value}
                        {cell.unit && (
                            <small className="ml-1 font-sans text-value font-semibold tracking-normal text-dim">
                                {cell.unit}
                            </small>
                        )}
                    </span>
                    {cell.sub && <span className="font-sans text-meta text-dim">{cell.sub}</span>}
                </div>
            ))}
        </div>
    );
}
