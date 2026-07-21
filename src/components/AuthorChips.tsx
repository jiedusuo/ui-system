"use client";

import type { MouseEvent } from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "../lib/cn";

function formatCount(n: number): string {
    return n.toLocaleString();
}

const authorChip = cva(
    [
        "group inline-flex max-w-full cursor-pointer items-baseline gap-2 overflow-hidden border-0 border-b-2 border-transparent bg-transparent px-2 py-1 leading-tight text-muted transition-colors",
        "[font:inherit]",
        "hover:bg-paper-2 hover:text-ink",
        "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--chip-accent)]",
        "[@media(pointer:coarse)]:px-2.5 [@media(pointer:coarse)]:py-2",
    ],
    {
        variants: {
            tone: {
                primary: "[--chip-accent:var(--color-primary)]",
                ink: "[--chip-accent:var(--color-ink)]",
            },
            selected: {
                false: null,
                true: "border-b-[var(--chip-accent)] bg-paper-2 text-ink",
            },
            check: {
                false: null,
                true: "items-center gap-2 px-2.5 py-2 [@media(pointer:coarse)]:px-3 [@media(pointer:coarse)]:py-2.5",
            },
            density: {
                default: null,
                compact:
                    "gap-1.5 px-1.5 py-1 [@media(pointer:coarse)]:px-2 [@media(pointer:coarse)]:py-1.5",
            },
        },
        defaultVariants: {
            tone: "primary",
            selected: false,
            check: false,
            density: "default",
        },
    },
);

const authorChipMark = cva(
    "relative inline-block size-3 shrink-0 border border-rule-soft bg-paper group-hover:border-ink",
    {
        variants: {
            selected: {
                false: null,
                true: [
                    "border-[var(--chip-accent)] bg-[var(--chip-accent)]",
                    "after:absolute after:left-1/2 after:top-1/2 after:h-0.5 after:w-1.5 after:-translate-x-1/2 after:-translate-y-[55%] after:-rotate-45",
                    "after:border-b-[1.5px] after:border-l-[1.5px] after:border-paper after:content-['']",
                ],
            },
        },
        defaultVariants: {
            selected: false,
        },
    },
);

export interface AuthorChipProps extends VariantProps<typeof authorChip> {
    label: string;
    count?: number | null;
    selected?: boolean;
    showCheck?: boolean;
    tone?: "primary" | "ink";
    density?: "default" | "compact";
    onClick?: (e: MouseEvent<HTMLButtonElement>) => void;
    title?: string;
    className?: string;
}

export function AuthorChip({
    label,
    count = null,
    selected = false,
    showCheck = false,
    tone = "primary",
    density = "default",
    onClick,
    title,
    className,
}: AuthorChipProps) {
    return (
        <button
            type="button"
            className={cn(authorChip({ tone, selected, check: showCheck, density }), className)}
            aria-pressed={selected}
            data-tooltip={title}
            onClick={(e) => onClick?.(e)}
        >
            {showCheck && <span className={authorChipMark({ selected })} aria-hidden="true" />}
            <span
                className={cn(
                    "min-w-0 truncate font-serif-cn font-semibold tracking-normal",
                    density === "compact" ? "text-mini" : "text-num",
                )}
            >
                {label}
            </span>
            {count !== null && count !== undefined && (
                <span
                    className={cn(
                        "font-sans text-mini text-dim tracking-caps-tight [font-variant-numeric:tabular-nums]",
                        selected && "text-muted",
                    )}
                >
                    {formatCount(count)}
                </span>
            )}
        </button>
    );
}

const splitChip = cva("inline-flex max-w-full items-stretch leading-tight [font:inherit]", {
    variants: {
        tone: {
            primary: "[--chip-accent:var(--color-primary)]",
            ink: "[--chip-accent:var(--color-ink)]",
        },
        member: {
            false: null,
            true: "[&_.author-split-box]:border-ink [&_.author-split-name]:border-ink [&_.author-split-name]:text-ink",
        },
        solo: {
            false: null,
            true: "[&_.author-split-box]:border-ink [&_.author-split-name]:border-ink [&_.author-split-name]:bg-ink [&_.author-split-name]:text-paper [&_.author-split-tally]:text-paper [&_.author-split-tally]:opacity-70",
        },
        density: {
            default: null,
            compact: null,
        },
    },
    defaultVariants: {
        tone: "primary",
        member: false,
        solo: false,
        density: "default",
    },
});

const splitBox =
    "author-split-box inline-grid w-7 cursor-pointer place-items-center border border-r-0 border-rule-soft bg-paper p-0 transition-colors hover:bg-paper-2 focus-visible:z-10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--chip-accent)] [@media(pointer:coarse)]:w-9";
const splitName =
    "author-split-name inline-flex min-w-0 max-w-full cursor-pointer items-baseline gap-1.5 border border-rule-soft bg-paper px-2.5 py-1.5 text-muted transition-colors hover:bg-paper-2 hover:text-ink focus-visible:z-10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--chip-accent)] [@media(pointer:coarse)]:px-3 [@media(pointer:coarse)]:py-2.5";
const splitBoxCompact = "w-6 [@media(pointer:coarse)]:w-8";
const splitNameCompact = "px-2 py-1 [@media(pointer:coarse)]:px-2.5 [@media(pointer:coarse)]:py-1.5";
const splitMark = cva(
    "relative size-[0.6875rem] border border-rule-soft bg-paper transition-colors group-hover:border-ink",
    {
        variants: {
            selected: {
                false: null,
                true: [
                    "border-[var(--chip-accent)] bg-[var(--chip-accent)]",
                    "after:absolute after:left-1/2 after:top-1/2 after:h-0.5 after:w-1.5 after:-translate-x-1/2 after:-translate-y-[60%] after:-rotate-45",
                    "after:border-b-[1.5px] after:border-l-[1.5px] after:border-paper after:content-['']",
                ],
            },
        },
        defaultVariants: {
            selected: false,
        },
    },
);

const liveDot = cva("size-[0.3125rem] shrink-0 self-center rounded-full", {
    variants: {
        activity: {
            active: "bg-ok",
            stale: "bg-ochre",
            dormant: "bg-dim",
        },
    },
    defaultVariants: {
        activity: "active",
    },
});

export interface AuthorSplitChipProps extends VariantProps<typeof splitChip> {
    label: string;
    count?: number | null;
    member?: boolean;
    solo?: boolean;
    live?: boolean;
    activity?: "active" | "stale" | "dormant";
    tone?: "primary" | "ink";
    density?: "default" | "compact";
    onToggle?: () => void;
    onSolo?: () => void;
    toggleOnLabel?: string;
    toggleOffLabel?: string;
    toggleTooltip?: string;
    soloTooltip?: string;
    className?: string;
}

export function AuthorSplitChip({
    label,
    count = null,
    member = false,
    solo = false,
    live = false,
    activity = "active",
    tone = "primary",
    density = "default",
    onToggle,
    onSolo,
    toggleOnLabel = `加入筛选 ${label}`,
    toggleOffLabel = `从筛选移出 ${label}`,
    toggleTooltip = "加入 / 移出选择",
    soloTooltip = "只看 TA",
    className,
}: AuthorSplitChipProps) {
    const hasCount = count !== null && count !== undefined;

    return (
        <span className={cn("ui-authorsplit", splitChip({ tone, member, solo, density }), className)}>
            <button
                type="button"
                className={cn("group", splitBox, density === "compact" && splitBoxCompact)}
                aria-pressed={member}
                aria-label={member ? toggleOffLabel : toggleOnLabel}
                data-tooltip={toggleTooltip}
                onClick={onToggle}
            >
                <span className={splitMark({ selected: member })} aria-hidden="true" />
            </button>
            <button
                type="button"
                className={cn(splitName, density === "compact" && splitNameCompact)}
                aria-pressed={solo}
                data-tooltip={soloTooltip}
                onClick={onSolo}
            >
                <span
                    className={cn(
                        "min-w-0 truncate whitespace-nowrap font-serif-cn font-semibold tracking-normal",
                        density === "compact" ? "text-mini" : "text-num",
                    )}
                >
                    {label}
                </span>
                {live && <span className={liveDot({ activity })} aria-hidden="true" />}
                {hasCount && (
                    <span className="author-split-tally font-sans text-mini text-dim tracking-caps-tight [font-variant-numeric:tabular-nums]">
                        {formatCount(count)}
                    </span>
                )}
            </button>
        </span>
    );
}
