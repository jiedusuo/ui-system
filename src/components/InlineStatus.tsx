import type { HTMLAttributes } from "react";
import { cva } from "class-variance-authority";

import { cn } from "../lib/cn";
import type { SemanticTone } from "../lib/semantic-tone";

/**
 * Bounded status message. It shares the system-wide semantic tone vocabulary
 * with InlineStatus, StatusDot, and NoticeBox.
 *
 * Renders a `<div role="status">`; caller `className` composes via `cn()`.
 */
const statusBox = cva(
    "border border-l-2 bg-paper px-panel py-action-y font-sans text-value",
    {
        variants: {
            tone: {
                neutral: "border-rule text-ink",
                info: "border-info text-info-2",
                success: "border-ok text-ok-2",
                warning: "border-ochre text-tint-warn-ink",
                error: "border-negative text-negative-2",
            },
        },
    },
);

export interface StatusBoxProps
    extends HTMLAttributes<HTMLDivElement> {
    tone: SemanticTone;
}

export function StatusBox({ className, tone, ...rest }: StatusBoxProps) {
    return (
        <div
            role="status"
            className={cn("ui-statusbox", `ui-statusbox--${tone}`, statusBox({ tone }), className)}
            {...rest}
        />
    );
}
