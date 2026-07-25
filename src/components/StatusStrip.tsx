"use client";

import { Fragment, type ReactNode } from "react";

import { cn } from "../lib/cn";

export type StatusDotTone = "live" | "idle" | "warn" | "ok" | "off";

/** A small round status indicator; `live` pulses. Token-driven tones. */
export function StatusDot({ tone, className }: { tone: StatusDotTone; className?: string }) {
    const fill: Record<StatusDotTone, string> = {
        live: "bg-ok",
        ok: "bg-ok",
        idle: "bg-dim",
        warn: "bg-ochre",
        off: "bg-dim",
    };
    return (
        <span
            aria-hidden
            className={cn(
                "relative inline-block size-2.5 shrink-0 rounded-full",
                fill[tone],
                tone === "live" &&
                    "after:absolute after:inset-0 after:animate-ping after:rounded-full after:bg-ok",
                className,
            )}
        />
    );
}

export interface StatusSegProps {
    /** Mono label shown dim before the value. */
    label?: ReactNode;
    children: ReactNode;
}

/** One labelled segment of the strip; value renders ink-bold. */
export function StatusSeg({ label, children }: StatusSegProps) {
    return (
        <span className="inline-flex items-center gap-1.5 whitespace-nowrap">
            {label && <span className="text-muted">{label}</span>}
            <span className="font-bold text-ink [&_b]:font-bold [&_b]:text-ink">{children}</span>
        </span>
    );
}

export interface StatusStripProps {
    /** Segments — rendered with a hairline mono "·" between each. */
    children: ReactNode[];
    /** Optional dim text pinned to the right edge. */
    right?: ReactNode;
    className?: string;
}

/**
 * The always-visible mono status rail: dot + labelled segments separated by
 * dim middots, with optional right-anchored text. Sits under the window bar
 * in the x-forwarder; generic enough for any "live readouts" strip.
 */
export function StatusStrip({ children, right, className }: StatusStripProps) {
    const segs = children.filter(Boolean);
    return (
        <div
            className={cn(
                "ui-statusstrip",
                "flex flex-wrap items-center gap-x-surface-x gap-y-field-gap border-b-2 border-rule bg-paper-2 px-surface-x py-action-y font-sans text-meta uppercase tracking-caps text-muted",
                className,
            )}
        >
            {segs.map((seg, i) => (
                <Fragment key={i}>
                    {i > 0 && <span className="text-dim">·</span>}
                    {seg}
                </Fragment>
            ))}
            {right && <span className="ml-auto whitespace-nowrap text-dim">{right}</span>}
        </div>
    );
}
