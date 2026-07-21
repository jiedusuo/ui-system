"use client";

import { useState, type MouseEvent } from "react";

import { cn } from "../lib/cn";

const TAIL = 6;

/**
 * Compact identifier chip: shows the tail six characters of an id, the full
 * value on hover (`title`), and copies the full id to the clipboard on one
 * click — the chip flashes a ✓ for ~1.2s to confirm. Machine literal, so the
 * face is `font-code`.
 *
 * Use it wherever a raw id must stay reachable but must not eat the row:
 * inside `EntityRef` (as the fallback when no label resolves), in detail
 * panels, in receipt keys. A null / empty id renders an em-dash, never an
 * empty cell.
 */
export function IdChip({ value, className }: { value: unknown; className?: string }) {
    const [copied, setCopied] = useState(false);
    if (value == null || value === "") return <span className="text-dim">—</span>;
    const id = String(value);
    const copy = (event: MouseEvent) => {
        event.stopPropagation();
        void navigator.clipboard?.writeText(id);
        setCopied(true);
        window.setTimeout(() => setCopied(false), 1200);
    };
    return (
        <span
            title={id}
            className={cn(
                "gap-1 bg-paper-2 px-2 py-0.5 font-code text-mini inline-flex w-fit items-center rounded-full border",
                copied ? "border-ok text-ok-2" : "border-rule text-ink",
                className,
            )}
        >
            …{id.slice(-TAIL)}
            <button
                type="button"
                aria-label="复制完整 id"
                onClick={copy}
                className="p-0 text-dim hover:text-primary cursor-pointer border-0 bg-transparent"
            >
                {copied ? "✓" : "⧉"}
            </button>
        </span>
    );
}

export interface EntityRefProps {
    /** Human label the CALLER already resolved. Absent → degrades to `IdChip`. */
    label?: string | null;
    id: unknown;
    /** Initial-letter avatar disc before the label. Default on. */
    avatar?: boolean;
    className?: string;
}

/**
 * Label-first reference to a domain entity (a stream, an actor, an account):
 * the human label in ink, its id trailing in dim `font-code` as a secondary.
 * When no label resolves it degrades to a bare `IdChip`.
 *
 * The design rule it exists to enforce: **never render a full column of raw
 * ULIDs.** Any table cell holding an entity id should be an `EntityRef`.
 *
 * Hidden contract: **this component never fetches.** Resolution is the
 * caller's job — the console passes the label it already has from its own
 * directory/SWR layer. Keep it that way; a shared primitive must not know
 * about an app's data layer.
 */
export function EntityRef({ label, id, avatar = true, className }: EntityRefProps) {
    if (id == null || id === "") return <span className="text-dim">—</span>;
    if (!label) return <IdChip value={id} className={className} />;
    return (
        <span
            className={cn("min-w-0 gap-1.5 inline-flex w-fit items-center", className)}
            title={String(id)}
        >
            {avatar && (
                <span
                    aria-hidden
                    className="size-6 bg-primary-soft font-sans text-mini font-bold text-primary inline-grid flex-none place-items-center rounded-full"
                >
                    {label.slice(0, 1)}
                </span>
            )}
            <span className="min-w-0">
                <span className="font-sans text-value font-semibold text-ink">{label}</span>{" "}
                <span className="font-code text-mini text-dim">…{String(id).slice(-TAIL)}</span>
            </span>
        </span>
    );
}
