"use client";

import { forwardRef, useState, type InputHTMLAttributes, type ReactNode } from "react";

import { cn } from "../lib/cn";
import { Kicker } from "./Field";

export interface SecretFieldProps
    extends Omit<InputHTMLAttributes<HTMLInputElement>, "type"> {
    label?: ReactNode;
    help?: ReactNode;
    /** Text for the reveal/hide toggle. Defaults to 显示 / 隐藏. */
    revealLabel?: [show: string, hide: string];
}

/**
 * IME-safe masked input — the right control for tokens/passphrases that may
 * contain Chinese (e.g. the site gate's 戒赌所).
 *
 * The trap: `<input type="password">` disables IME composition on
 * macOS/iOS/most Android, so you literally cannot type Chinese into it. So we
 * keep `type="text"` ALWAYS and mask with CSS `-webkit-text-security: disc`.
 * The reveal toggle flips that CSS — it never touches the input `type`, so
 * composition is never interrupted. Firefox <119 has no
 * `-webkit-text-security`; there the toggle is the only mask, which is why we
 * still ship a reveal button rather than relying on the CSS alone.
 */
export const SecretField = forwardRef<HTMLInputElement, SecretFieldProps>(function SecretField(
    { label, help, className, revealLabel = ["显示", "隐藏"], ...rest },
    ref,
) {
    const [revealed, setRevealed] = useState(false);
    return (
        <label className="grid gap-1.5">
            {label && <Kicker>{label}</Kicker>}
            <div className="flex gap-2">
                <input
                    ref={ref}
                    type="text"
                    inputMode="text"
                    spellCheck={false}
                    autoCapitalize="off"
                    autoCorrect="off"
                    className={cn(
                        "ui-control",
                        "min-w-0 flex-1 font-code text-num px-2.5 py-2 border border-ink bg-paper text-ink outline-none focus:outline-2 focus:-outline-offset-2 focus:outline-ink placeholder:text-dim",
                        // -webkit-text-security has no Tailwind utility — this masks
                        // while keeping type=text so IME composition keeps working.
                        revealed ? "[-webkit-text-security:none] tracking-normal" : "[-webkit-text-security:disc]",
                        className,
                    )}
                    {...rest}
                />
                <button
                    type="button"
                    aria-pressed={revealed}
                    onClick={() => setRevealed((v) => !v)}
                    className="ui-secret-reveal shrink-0 border border-rule-soft bg-paper px-3 font-sans text-label uppercase tracking-caps text-muted hover:border-ink hover:bg-ink hover:text-paper"
                >
                    {revealed ? revealLabel[1] : revealLabel[0]}
                </button>
            </div>
            {help && (
                <span className="font-sans text-label leading-snug text-muted [&_b]:text-ink">{help}</span>
            )}
        </label>
    );
});
