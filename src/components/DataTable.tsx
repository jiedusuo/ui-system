import type { TableHTMLAttributes, TdHTMLAttributes, ThHTMLAttributes } from "react";

import { cn } from "../lib/cn";

/**
 * `.data-table` (base.css) as components. `DataTable` carries the table
 * chrome (full-width, collapsed borders, sans face, tabular numerals);
 * the per-cell padding/border chrome can't be expressed from the table
 * element with plain utilities, so `Th`/`Td` carry their own classes.
 *
 * `Th`/`Td` are thin `<th>`/`<td>` wrappers (no context magic) meant as
 * drop-in replacements for the per-page admin helpers: `align` maps to
 * `text-left|center|right` (Th defaults left — the helpers always set
 * an explicit alignment), `className` composes via `cn()`, and
 * everything else (`colSpan`, `style`, …) spreads onto the element.
 */
export interface DataTableProps extends TableHTMLAttributes<HTMLTableElement> {}

export function DataTable({ className, ...rest }: DataTableProps) {
    return (
        <table
            className={cn(
                "w-full border-collapse font-sans tabular-nums [font-feature-settings:'tnum']",
                className,
            )}
            {...rest}
        />
    );
}

const alignClass = {
    left: "text-left",
    center: "text-center",
    right: "text-right",
} as const;

export interface ThProps extends Omit<ThHTMLAttributes<HTMLTableCellElement>, "align"> {
    align?: keyof typeof alignClass;
}

/** `.data-table th`: hairline-ink bottom rule, dim mini uppercase head. */
export function Th({ className, align = "left", ...rest }: ThProps) {
    return (
        <th
            className={cn(
                "border-b border-ink px-panel-y pb-control-y pt-action-y align-top font-semibold uppercase tracking-caps text-mini text-dim first:pl-panel last:pr-panel",
                alignClass[align],
                className,
            )}
            {...rest}
        />
    );
}

export interface TdProps extends Omit<TdHTMLAttributes<HTMLTableCellElement>, "align"> {
    align?: keyof typeof alignClass;
}

/** `.data-table td`: hairline rule-soft bottom rule, ink caps-num cell. */
export function Td({ className, align = "left", ...rest }: TdProps) {
    return (
        <td
            className={cn(
                "border-b border-rule-soft px-panel-y py-panel-y align-top text-num text-ink first:pl-panel last:pr-panel",
                alignClass[align],
                className,
            )}
            {...rest}
        />
    );
}
