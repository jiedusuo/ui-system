"use client";

import { forwardRef, type InputHTMLAttributes } from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "../lib/cn";

/**
 * Bottom-hairline mono input — CVA port of the admin pages' shared
 * `inputStyle` object (accounts/tokens): paper-2 fill, no border except
 * a hairline ink bottom rule, mono `text-num`, `0.5714rem 0`
 * padding, ink text. The admin `.acct-input` class carries no CSS rules
 * of its own (it's a bare hook class on elements that also get
 * `style={inputStyle}`), so there is nothing extra to fold in and no
 * variants are needed. `focus:outline-none` matches the admin local
 * `<Input>` wrapper which always pairs `inputStyle` with that class.
 *
 * Named `LineInput` (not `Input`) because the barrel already exports
 * the boxed-hairline `Input`/`InputProps` from `Field.tsx`.
 *
 * Width is the caller's business (the admin idiom sets `10rem`/`24rem`
 * per use); pass it via `className`/`style`.
 */
const lineInput = cva(
    "border-0 border-b border-ink bg-paper-2 px-0 py-[0.5714rem] font-code text-num text-ink focus:outline-none",
);

export interface LineInputProps
    extends InputHTMLAttributes<HTMLInputElement>,
        VariantProps<typeof lineInput> {}

export const LineInput = forwardRef<HTMLInputElement, LineInputProps>(function LineInput(
    { className, ...rest },
    ref,
) {
    return <input ref={ref} className={cn("ui-lineinput", lineInput(), className)} {...rest} />;
});
