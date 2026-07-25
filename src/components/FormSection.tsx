import type { ReactNode } from "react";

import { cn } from "../lib/cn";

export interface FormSectionProps {
    /** Chinese scope title (e.g. 默认策略). */
    title: ReactNode;
    /** The scope's wire name — `write_policy · actor_id = null`. A machine
     * literal, rendered `font-code`. */
    sub?: ReactNode;
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
 * Hidden contract: the save button and the `ReceiptPanel` are CHILDREN you
 * compose (their wiring — endpoint, `Idempotency-Key`, validation — is
 * per-scope); this component owns only the boundary, the title/sub, and the
 * dirty/busy affordance. `dirty` draws an accent border + ring and a 未保存
 * badge, so an unsaved scope is unmistakable among its clean siblings; keep the
 * save button disabled until `dirty`. `busy` renders as a disabled fieldset, so
 * a child control needs no `disabled={busy}` of its own.
 */
export function FormSection({ title, sub, dirty, busy, children, className }: FormSectionProps) {
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
            <div className="gap-stack-md flex items-baseline">
                <div className="min-w-0 gap-stack-xs flex flex-1 flex-col">
                    <span className="font-sans text-card-title font-bold text-ink">{title}</span>
                    {sub && <span className="font-code text-mini text-dim">{sub}</span>}
                </div>
                {dirty && (
                    <span className="bg-tint-primary px-2 py-0.5 font-sans text-mini font-bold text-primary flex-none rounded-full">
                        未保存
                    </span>
                )}
            </div>
            {children}
        </fieldset>
    );
}
