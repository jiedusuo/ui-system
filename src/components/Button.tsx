"use client";

import { forwardRef, type ButtonHTMLAttributes } from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "../lib/cn";

/**
 * Wired editorial button. The family is token-driven and now monochrome:
 * `--color-primary` resolves to ink (#000), so the CTA is a flat solid black
 * block, not an accented one. Square corners, hairline/ink borders, no offset
 * shadow and no hover-translate — emphasis comes from flat fill inversion.
 *
 * Mono family (uppercase mono caps, 100ms fill transition, disabled 40%):
 *  - `default`  hairline-ink chip, fills ink on hover (the workhorse)
 *  - `ghost`    soft-rule, muted — secondary actions
 *  - `primary`  flat solid ink block (the CTA); hover inverts to paper/ink
 *  - `stop`     status-red halt button: red border/text on paper, fills red on hover
 *
 * Serif family — CVA port of the global `.btn` class (base.css): display
 * serif at `text-card-title` (1.1429rem) / 600, `0.8571rem 1.5714rem`
 * padding, hairline ink border, no uppercase/tracking, NO hover transition
 * (the `.btn` inversion is instant), disabled 50% (vs the mono family's 40):
 *  - `serif`         `.btn`: paper bg / ink text, hover fills ink
 *  - `serifPrimary`  `.btn--primary`: ink bg / paper text, hover inverts to paper/ink
 *  - `serifGhost`    `.btn--ghost`: transparent bg, otherwise `.btn`
 *
 * Sizing: `size="tiny"` is the compact mono form used inside dense rows
 * (token toggle, "打开文件夹"). The `.btn` padding/type size lives in
 * `size="serif"`, which is applied automatically when a serif variant is
 * used without an explicit `size` — `<Button variant="serif">` alone
 * renders the exact `.btn` box. All variants compose with a caller
 * `className` via `cn()`.
 */
const button = cva(
    "inline-flex items-center justify-center gap-2 whitespace-nowrap font-semibold cursor-pointer disabled:cursor-not-allowed",
    {
        variants: {
            variant: {
                default:
                    "border border-ink bg-paper text-ink hover:bg-ink hover:text-paper",
                ghost: "border border-rule-soft bg-paper text-muted hover:border-ink hover:bg-ink hover:text-paper",
                primary:
                    "border border-ink bg-ink text-paper hover:bg-paper hover:text-ink",
                stop: "border border-loss bg-paper text-loss hover:bg-loss hover:text-paper",
                serif: "border border-ink bg-paper text-ink hover:bg-ink hover:text-paper",
                serifPrimary:
                    "border border-ink bg-ink text-paper hover:bg-paper hover:text-ink",
                serifGhost:
                    "border border-ink bg-transparent text-ink hover:bg-ink hover:text-paper",
            },
            size: {
                md: "text-meta px-action-x py-action-y",
                tiny: "text-label px-action-compact-x py-action-compact-y",
                cta: "text-cta gap-3 px-6 py-4",
                serif: "text-card-title px-[1.5714rem] py-[0.8571rem]",
            },
        },
        compoundVariants: [
            {
                variant: ["default", "ghost", "primary", "stop"],
                class: "font-sans uppercase tracking-caps transition-[background,color] duration-100 disabled:opacity-40",
            },
            {
                variant: ["serif", "serifPrimary", "serifGhost"],
                class: "font-display disabled:opacity-50",
            },
        ],
        defaultVariants: { variant: "default", size: "md" },
    },
);

const SERIF_VARIANTS = ["serif", "serifPrimary", "serifGhost"] as const;

export interface ButtonProps
    extends ButtonHTMLAttributes<HTMLButtonElement>,
        VariantProps<typeof button> {}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
    { className, variant, size, type = "button", ...rest },
    ref,
) {
    // Serif variants default to the `.btn` box; mono variants keep `md`.
    const resolvedSize =
        size ?? (SERIF_VARIANTS.includes(variant as (typeof SERIF_VARIANTS)[number]) ? "serif" : undefined);
    // Stable hook classes (`ui-btn` / `ui-btn--<variant>`) so the Stripe
    // overlay (jiedusuo.css, admin+desktop only) can round + soften + accent
    // the button without touching the Wired/public render — the classes are
    // inert where jiedusuo.css is not imported.
    const variantHook = `ui-btn--${variant ?? "default"}`;
    return (
        <button
            ref={ref}
            type={type}
            className={cn("ui-btn", variantHook, button({ variant, size: resolvedSize }), className)}
            {...rest}
        />
    );
});
