import type { HTMLAttributes } from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "../lib/cn";

/**
 * Inline status frame — CVA port of `.inline-status` (base.css): flat
 * hairline ink frame with a 2px accent bar on the left (Level-2
 * emphasis), paper background, mono 0.8571rem (`text-value`),
 * `0.7143rem 1rem` padding.
 *
 *  - `tone="default"` ink frame / ink text
 *  - `tone="ok"`      `.inline-status--ok`: --ok border, --ok-2 text
 *  - `tone="err"`     `.inline-status--err`: --negative border, --negative-2 text
 *  - `tone="warn"`    new (no `.inline-status--warn` exists in CSS):
 *                     --ochre border, --tint-warn-ink text
 *
 * Named `StatusBox` because the barrel already exports a different
 * `InlineStatus` (the status-dot + mono-caption row in
 * `PagePrimitives.tsx`, used by the public site).
 *
 * Renders a `<div role="status">`; caller `className` composes via `cn()`.
 */
const statusBox = cva(
    "border border-l-2 bg-paper px-4 py-[0.7143rem] font-sans text-value",
    {
        variants: {
            tone: {
                default: "border-ink text-ink",
                ok: "border-ok text-ok-2",
                err: "border-negative text-negative-2",
                warn: "border-ochre text-tint-warn-ink",
            },
        },
        defaultVariants: { tone: "default" },
    },
);

export interface StatusBoxProps
    extends HTMLAttributes<HTMLDivElement>,
        VariantProps<typeof statusBox> {}

export function StatusBox({ className, tone, ...rest }: StatusBoxProps) {
    return (
        <div
            role="status"
            className={cn("ui-statusbox", `ui-statusbox--${tone ?? "default"}`, statusBox({ tone }), className)}
            {...rest}
        />
    );
}
