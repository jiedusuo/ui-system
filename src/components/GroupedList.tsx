"use client";

import { useState, type ReactNode } from "react";
import { ChevronDown } from "lucide-react";

import { cn } from "../lib/cn";
import { Collapse } from "./Collapse";

export function GroupedList({
    children,
    className,
}: {
    children: ReactNode;
    className?: string;
}) {
    return (
        <div role="list" className={cn("ui-grouped-list gap-stack-md grid", className)}>
            {children}
        </div>
    );
}

export interface GroupedListGroupProps {
    title: ReactNode;
    meta?: ReactNode;
    children: ReactNode;
    defaultOpen?: boolean;
    className?: string;
}

/** One independently expandable group inside a dense operational list. */
export function GroupedListGroup({
    title,
    meta,
    children,
    defaultOpen = true,
    className,
}: GroupedListGroupProps) {
    const [open, setOpen] = useState(defaultOpen);
    return (
        <section
            role="listitem"
            className={cn(
                "ui-grouped-list-group border-rule-soft bg-paper overflow-hidden rounded-[var(--radius-surface)] border shadow-[var(--elevation-card)]",
                className,
            )}
        >
            <button
                type="button"
                aria-expanded={open}
                onClick={() => setOpen((value) => !value)}
                className="gap-control-x bg-paper-2 px-panel py-panel-y hover:bg-paper-3 flex w-full cursor-pointer items-center border-0 text-left"
            >
                <ChevronDown
                    aria-hidden
                    className={cn(
                        "size-4.5 text-dim flex-none transition-transform duration-[var(--motion-fast)] motion-reduce:transition-none",
                        !open && "-rotate-90",
                    )}
                />
                <span className="min-w-0 font-sans text-card-title font-bold text-ink flex-1 truncate">
                    {title}
                </span>
                {meta && (
                    <span className="gap-control-x flex flex-none flex-wrap items-center justify-end">
                        {meta}
                    </span>
                )}
            </button>
            <Collapse open={open}>{children}</Collapse>
        </section>
    );
}
