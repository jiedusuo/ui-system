import { clsx, type ClassValue } from "clsx";
import { extendTailwindMerge } from "tailwind-merge";

/**
 * twMerge configured for our @theme tokens. Stock tailwind-merge can't
 * tell a custom font-size utility (`text-mini`, from the
 * `--text-mini` @theme entry) from a text-color utility, so it
 * classifies both as colors and silently drops whichever comes first
 * when a class list carries a size AND a color (`text-mini
 * text-dim` → `text-dim`). Register every `--text-*` token as a
 * font-size class so sizes and colors merge independently.
 */
const twMerge = extendTailwindMerge({
    extend: {
        classGroups: {
            "font-size": [
                {
                    text: [
                        "micro",
                        "mini",
                        "label",
                        "meta",
                        "value",
                        "num",
                        "num-lg",
                        "kv",
                        "pnl",
                        "ticker",
                        "ticker-display",
                        "display-italic",
                        "lede",
                        "card-title",
                        "wordmark",
                        "hero",
                        "body",
                        "cta",
                    ],
                },
            ],
        },
    },
});

/**
 * Merge class names with Tailwind-aware conflict resolution.
 *
 * `clsx` flattens conditionals/arrays/objects into a class string; `twMerge`
 * then resolves Tailwind conflicts so a later utility wins over an earlier one
 * of the same family (`px-4` overrides `px-2`, `bg-paper` overrides `bg-ink`).
 * This is what lets the CVA primitives accept a caller `className` that
 * overrides their defaults instead of both landing in the DOM and fighting.
 */
export function cn(...inputs: ClassValue[]): string {
    return twMerge(clsx(inputs));
}
