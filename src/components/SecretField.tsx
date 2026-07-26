"use client";

import { forwardRef, useId, useState, type InputHTMLAttributes, type ReactNode } from "react";

import { cn } from "../lib/cn";
import { controlClass, controlDensity, Kicker } from "./Field";

export interface SecretFieldProps
    extends Omit<InputHTMLAttributes<HTMLInputElement>, "type"> {
    label?: ReactNode;
    help?: ReactNode;
    error?: ReactNode;
    /** Text for the reveal/hide toggle. Defaults to 显示 / 隐藏. */
    revealLabel?: [show: string, hide: string];
    density?: keyof typeof controlDensity;
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
    {
        label,
        help,
        error,
        id,
        className,
        revealLabel = ["显示", "隐藏"],
        density = "default",
        "aria-describedby": describedBy,
        "aria-invalid": invalid,
        ...rest
    },
    ref,
) {
    const [revealed, setRevealed] = useState(false);
    const generatedId = useId();
    const errorId = useId();
    const helpId = useId();
    const inputId = id ?? generatedId;
    const descriptionIds = [
        describedBy,
        error ? errorId : null,
        help ? helpId : null,
    ]
        .filter(Boolean)
        .join(" ") || undefined;
    return (
        <div className="grid gap-field-gap">
            {label && (
                <label htmlFor={inputId}>
                    <Kicker className={density === "compact" ? "text-mini" : undefined}>
                        {label}
                    </Kicker>
                </label>
            )}
            <div className="flex gap-control-compact-x">
                <input
                    ref={ref}
                    id={inputId}
                    type="text"
                    inputMode="text"
                    spellCheck={false}
                    autoCapitalize="off"
                    autoCorrect="off"
                    className={cn(
                        "ui-control",
                        "min-w-0 flex-1",
                        controlClass,
                        controlDensity[density],
                        "font-code",
                        // -webkit-text-security has no Tailwind utility — this masks
                        // while keeping type=text so IME composition keeps working.
                        revealed ? "[-webkit-text-security:none] tracking-normal" : "[-webkit-text-security:disc]",
                        className,
                    )}
                    aria-invalid={error ? true : invalid}
                    aria-describedby={descriptionIds}
                    {...rest}
                />
                <button
                    type="button"
                    aria-pressed={revealed}
                    onClick={() => setRevealed((v) => !v)}
                    className="ui-secret-reveal shrink-0 border border-rule-soft bg-paper px-action-compact-x font-sans text-label uppercase tracking-caps text-muted hover:border-ink hover:bg-ink hover:text-paper"
                >
                    {revealed ? revealLabel[1] : revealLabel[0]}
                </button>
            </div>
            {error && (
                <span
                    id={errorId}
                    role="alert"
                    className={cn(
                        "font-sans leading-snug text-negative",
                        density === "compact" ? "text-mini" : "text-label",
                    )}
                >
                    {error}
                </span>
            )}
            {help && (
                <span
                    id={helpId}
                    className={cn(
                        "font-sans leading-snug text-muted [&_b]:text-ink",
                        density === "compact" ? "text-mini" : "text-label",
                    )}
                >
                    {help}
                </span>
            )}
        </div>
    );
});
