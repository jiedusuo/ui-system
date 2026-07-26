import type { ReactNode } from "react";

import { cn } from "../lib/cn";

export interface FormSectionProps {
    /** Chinese scope title (e.g. 默认策略). */
    title: ReactNode;
    /** The scope's wire name — `write_policy · actor_id = null`. A machine
     * literal, rendered `font-code`. */
    sub?: ReactNode;
    /** Human-readable context for the scope header (count, owner, revision). */
    headerMeta?: ReactNode;
    /** Controls that act on this scope, aligned with its title. */
    actions?: ReactNode;
    /** Receipt, validation summary, or other material after the fields. */
    footer?: ReactNode;
    /** Fields differ from what the server holds. Lights the accent boundary. */
    dirty?: boolean;
    /** A save for this scope is in flight: every control inside is disabled
     * (the fields keep their values — no flash, no unmount). */
    busy?: boolean;
    children: ReactNode;
    className?: string;
}

/**
 * The container for ONE mutation scope: a bounded card holding the scope's
 * fields, its own save button, and its own receipt.
 *
 * Use it for every write in the console. A page may carry several — the streams
 * row editor has three (`write_stream`, `write_policy`, `write_route`) — and the
 * rule this component exists to enforce is: **a save button lives inside the
 * visual boundary of the fields it affects**. Two bare 保存 buttons on one page
 * with no boundary between them is the bug.
 *
 * The endpoint wiring remains app-owned, but earned composition seats keep
 * actions and receipts attached to the fields they govern. `dirty` draws an
 * accent border + ring and a 未保存 badge; `busy` disables the whole fieldset.
 */
export function FormSection({
    title,
    sub,
    headerMeta,
    actions,
    footer,
    dirty,
    busy,
    children,
    className,
}: FormSectionProps) {
    return (
        <fieldset
            disabled={busy}
            aria-busy={busy}
            data-dirty={dirty ? "true" : undefined}
            className={cn(
                "min-w-0 gap-stack-md bg-paper p-panel grid rounded-[var(--radius-surface)] border transition-[border-color,box-shadow,opacity] duration-[var(--motion-fast)] motion-reduce:transition-none",
                dirty
                    ? "border-primary shadow-[0_0_0_3px_var(--color-accent-ring)]"
                    : "border-rule-soft shadow-[var(--elevation-card)]",
                busy && "opacity-70",
                className,
            )}
        >
            <div className="gap-stack-md flex flex-wrap items-start">
                <div className="min-w-0 gap-stack-xs flex flex-1 flex-col">
                    <span className="font-sans text-card-title font-bold text-ink">{title}</span>
                    {sub && <span className="font-code text-mini text-dim">{sub}</span>}
                </div>
                <div className="gap-control-x flex flex-none flex-wrap items-center justify-end">
                    {headerMeta && (
                        <span className="font-sans text-mini text-muted">{headerMeta}</span>
                    )}
                    {dirty && (
                        <span className="bg-tint-primary px-2 py-0.5 font-sans text-mini font-bold text-primary flex-none rounded-full">
                            未保存
                        </span>
                    )}
                    {actions}
                </div>
            </div>
            {children}
            {footer && (
                <div className="border-rule-soft pt-stack-md border-t">{footer}</div>
            )}
        </fieldset>
    );
}
