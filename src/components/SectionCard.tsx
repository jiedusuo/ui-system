"use client";

import type { ReactNode } from "react";

import { cn } from "../lib/cn";

export interface SectionCardProps {
    /** Serif section title (e.g. 登录 X). */
    title: ReactNode;
    /** Mono uppercase English subtitle under the title. */
    en?: ReactNode;
    /** Right-aligned mono meta (e.g. a status pill or "3 个账号"). */
    meta?: ReactNode;
    children: ReactNode;
    className?: string;
    /** Drop the body padding (for tables/lists that manage their own). */
    flush?: boolean;
}

/**
 * A bordered section: a paper-2 header bar (serif title + mono EN subtitle on
 * the left, meta flush right) over a hairline rule, then the body. The whole
 * card is hairline-ruled top/bottom so cards stack into a newsprint column.
 * Distinct from the existing rule-only `SectionHead` — this one owns a titled
 * header AND a body container, which the x-forwarder sign-in / watchlist
 * sections need.
 */
export function SectionCard({ title, en, meta, children, className, flush }: SectionCardProps) {
    return (
        <section
            className={cn(
                "ui-sectioncard",
                "border-b border-rule last:border-b-0",
                className,
            )}
        >
            <div className="ui-sectioncard-head flex items-baseline gap-stack-md border-b border-rule bg-paper-2 px-surface-x py-panel-y">
                <div className="flex min-w-0 flex-1 flex-col gap-px">
                    <span className="font-display text-lede font-extrabold leading-none whitespace-nowrap">
                        {title}
                    </span>
                    {en && (
                        <span className="font-sans text-mini uppercase tracking-caps-loose text-muted">
                            {en}
                        </span>
                    )}
                </div>
                {meta && (
                    <span className="font-sans text-label uppercase tracking-caps text-muted">{meta}</span>
                )}
            </div>
            <div className={flush ? "" : "px-surface-x pt-surface-y pb-surface-bottom"}>{children}</div>
        </section>
    );
}
