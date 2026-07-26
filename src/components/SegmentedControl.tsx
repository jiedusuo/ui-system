"use client";

import type { ElementType, ReactNode } from "react";

import { cn } from "../lib/cn";

export interface SegmentOption<Value extends string = string> {
    value: Value;
    label: ReactNode;
    icon?: ElementType;
}

export interface SegmentedControlProps<Value extends string = string> {
    value: Value;
    options: readonly SegmentOption<Value>[];
    onChange: (value: Value) => void;
    ariaLabel: string;
    className?: string;
}

/**
 * Switches between sibling tasks in one workspace. Unlike SectionNav it does
 * not navigate or scroll; it exposes tab semantics and keeps every option at
 * equal hierarchy.
 */
export function SegmentedControl<Value extends string>({
    value,
    options,
    onChange,
    ariaLabel,
    className,
}: SegmentedControlProps<Value>) {
    return (
        <div
            role="tablist"
            aria-label={ariaLabel}
            className={cn(
                "ui-segmented gap-1 border-rule-soft bg-paper-2 p-1 flex overflow-x-auto rounded-[var(--radius-surface)] border",
                className,
            )}
        >
            {options.map((option) => {
                const Icon = option.icon;
                const selected = option.value === value;
                return (
                    <button
                        key={option.value}
                        type="button"
                        role="tab"
                        aria-selected={selected}
                        onClick={() => onChange(option.value)}
                        className={cn(
                            "gap-control-compact-x px-action-compact-x py-control-y font-sans text-value flex flex-none cursor-pointer items-center rounded-[var(--radius-control)] transition-colors duration-[var(--motion-fast)] motion-reduce:transition-none",
                            selected
                                ? "bg-paper text-ink shadow-[var(--elevation-control)]"
                                : "text-muted hover:bg-paper hover:text-ink",
                        )}
                    >
                        {Icon && <Icon className="size-4" aria-hidden />}
                        {option.label}
                    </button>
                );
            })}
        </div>
    );
}
