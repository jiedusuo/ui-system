"use client";

import { useState, type ReactNode } from "react";
import { ChevronRight, TriangleAlert } from "lucide-react";

import { cn } from "../lib/cn";
import { Collapse } from "./Collapse";

export interface DangerZoneProps {
    /** Chinese title of the destructive family (e.g. 危险操作 · 撤销与自愈). */
    title: ReactNode;
    /** Open on mount. Default closed — the point is that it costs a click. */
    defaultOpen?: boolean;
    /** `DangerStep`s. */
    children: ReactNode;
    className?: string;
}

/**
 * The home of every destructive mutation on a page: a negative-toned, collapsed
 * panel that only opens on an explicit click, containing numbered `DangerStep`s.
 *
 * Use it for anything that loses or rewrites state an operator cannot get back
 * — `finalize_unknown_self_recovery`, revoking a stream, wiping a parse scope.
 * Such an action must never sit in the page flow looking like an ordinary retry
 * button; putting it here is what makes it read as irreversible.
 *
 * Hidden contract: the steps are the design, not decoration. Step 1 shows the
 * IMPACT (what rows/orders this touches, counted, before anything is sent), and
 * only a later step carries the confirm control — impact first, colour never
 * alone. Expansion reuses the shared `Collapse` (grid-rows, reduced-motion
 * aware); there is no second expand mechanism.
 */
export function DangerZone({ title, defaultOpen, children, className }: DangerZoneProps) {
    const [open, setOpen] = useState(!!defaultOpen);
    return (
        <div
            className={cn(
                "bg-paper overflow-hidden rounded-[var(--radius-surface)] border border-[var(--color-negative-border)]",
                className,
            )}
        >
            <button
                type="button"
                aria-expanded={open}
                onClick={() => setOpen((v) => !v)}
                className="gap-2.5 bg-tint-negative px-4 py-2.5 font-sans text-value font-bold text-negative-2 flex w-full cursor-pointer items-center text-left"
            >
                <TriangleAlert className="size-4 flex-none" aria-hidden />
                <span className="min-w-0 flex-1">{title}</span>
                <ChevronRight
                    aria-hidden
                    className={cn(
                        "size-4 flex-none transition-transform duration-[var(--motion-fast)] motion-reduce:transition-none",
                        open && "rotate-90",
                    )}
                />
            </button>
            <Collapse open={open}>
                <div className="gap-3.5 p-4 grid">{children}</div>
            </Collapse>
        </div>
    );
}

export interface DangerStepProps {
    /** Step number, 1-based. */
    n: number;
    /** What this step is (e.g. 影响面 / 确认撤销). */
    title: ReactNode;
    children: ReactNode;
    className?: string;
}

/**
 * One numbered step inside a `DangerZone` — a hairline box with a negative-toned
 * numbered head over its body.
 *
 * Steps are ordered and the order is the safety mechanism: impact first
 * (「本次将撤销 37 条」), confirmation last. Do not use a single step to hold
 * both a summary and its own confirm button — that is the ordinary button the
 * `DangerZone` exists to prevent.
 */
export function DangerStep({ n, title, children, className }: DangerStepProps) {
    return (
        <div
            className={cn(
                "border-rule-soft p-3.5 rounded-[var(--radius-control)] border",
                className,
            )}
        >
            <div className="mb-2.5 gap-2 font-sans text-meta font-bold tracking-caps text-negative-2 flex items-center">
                <span className="bg-tint-negative font-sans text-label inline-grid size-[1.25rem] flex-none place-items-center rounded-full [font-variant-numeric:tabular-nums]">
                    {n}
                </span>
                {title}
            </div>
            {children}
        </div>
    );
}
