"use client";

import type { ReactNode } from "react";

import { cn } from "../lib/cn";

export interface SwitchProps {
    on: boolean;
    onChange?: (next: boolean) => void;
    disabled?: boolean;
    "aria-label"?: string;
    /** Optional 开/关 (or custom) text rendered beside the track. */
    labels?: [off: string, on: string];
    /** `sm` is the dense operator-row size (36×20); `md` (44×24) is the default. */
    size?: "md" | "sm";
    className?: string;
}

/**
 * Switch: bordered track on paper, a square thumb that slides and inverts to
 * paper when on. The `ui-switch-track` / `ui-switch-thumb` hooks let jiedusuo.css
 * re-theme it per surface (the accent ON track).
 */
export function Switch({ on, onChange, disabled, labels, size = "md", className, "aria-label": ariaLabel }: SwitchProps) {
    const sm = size === "sm";
    return (
        <button
            type="button"
            role="switch"
            aria-checked={on}
            aria-label={ariaLabel}
            disabled={disabled}
            data-on={on ? "true" : "false"}
            onClick={() => onChange?.(!on)}
            className={cn(
                "inline-flex shrink-0 items-center gap-2.5 border-0 bg-transparent p-0",
                disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer",
                className,
            )}
        >
            <span
                aria-hidden
                data-on={on ? "true" : "false"}
                className={cn(
                    "ui-switch-track relative border border-ink transition-colors duration-150",
                    sm ? "h-5 w-9" : "h-6 w-11",
                    on ? "bg-ink" : "bg-paper",
                )}
            >
                {/* The thumb's size is DERIVED from the track: inset-y-0.5 + aspect-square
                 *  makes it (inner height − 4px) square, so it is centred by construction
                 *  and the on-state travel lands 2px from the right edge — exactly the 2px
                 *  it sits from the left when off. A hardcoded size-4 was 1px high and 2px
                 *  short of the far edge on the md track. */}
                <span
                    className={cn(
                        "ui-switch-thumb absolute inset-y-0.5 left-0.5 aspect-square transition-transform duration-150",
                        on ? (sm ? "translate-x-4" : "translate-x-5") : "translate-x-0",
                        on ? "bg-paper" : "bg-ink",
                    )}
                />
            </span>
            {labels && (
                <span className="min-w-14 font-sans text-label uppercase tracking-caps text-muted">
                    {on ? labels[1] : labels[0]}
                </span>
            )}
        </button>
    );
}

export interface SwitchRowProps {
    title: ReactNode;
    sub?: ReactNode;
    on: boolean;
    onChange?: (next: boolean) => void;
    disabled?: boolean;
    labels?: [off: string, on: string];
    /** Forwarded to the Switch — `sm` for a dense settings list. */
    size?: SwitchProps["size"];
    className?: string;
}

/** A settings row: title + sub-label on the left, a Switch flush right,
 *  separated from siblings by a dashed hairline. */
export function SwitchRow({ title, sub, on, onChange, disabled, labels, size, className }: SwitchRowProps) {
    return (
        <div
            className={cn(
                "flex items-center justify-between gap-4 border-b border-dashed border-rule-soft py-2.5 last:border-b-0",
                className,
            )}
        >
            <span className="grid min-w-0 gap-0.5">
                <span className="font-display text-num font-bold">{title}</span>
                {sub && <span className="font-sans text-label text-muted">{sub}</span>}
            </span>
            <Switch on={on} onChange={onChange} disabled={disabled} labels={labels} size={size} aria-label={typeof title === "string" ? title : undefined} />
        </div>
    );
}
