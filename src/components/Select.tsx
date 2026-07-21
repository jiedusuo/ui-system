"use client";

import { forwardRef, type SelectHTMLAttributes } from "react";
import { ChevronDown } from "lucide-react";

import { cn } from "../lib/cn";
import { controlClass, controlDensity } from "./Field";

export interface SelectOption {
    value: string;
    label: string;
}

export interface SelectProps extends Omit<
    SelectHTMLAttributes<HTMLSelectElement>,
    "onChange" | "children"
> {
    value: string;
    onChange: (value: string) => void;
    options: readonly SelectOption[];
    /** Render the control in `font-code` — for machine literals (parser keys, enum values, ids). */
    code?: boolean;
    density?: keyof typeof controlDensity;
}

/**
 * The system's dropdown: a REAL `<select>`, wearing the same box as
 * `<Input>` — same border/paper/focus-ring/density grammar, plus a chevron
 * and the disabled wash. Reach for it wherever a form picks one value from a
 * closed set (parser, tone, account, environment).
 *
 * Hidden contract:
 *  - It is native on purpose. Keyboard, type-ahead, form submission and the
 *    mobile system picker all come for free; there is no popup to theme and
 *    no listbox to get wrong. If a picker needs search, avatars or multi-select,
 *    it is NOT this component — build that one instead of bending this one.
 *  - `onChange` hands you the string value, not the event.
 *  - `options` are plain `{value,label}`; the label is UI copy (Chinese), the
 *    value is the wire value. When the *values* are the thing the operator
 *    reads (a parser key, an enum), pass `code` so the closed control renders
 *    the selection in Geist Mono — that is the only monospace, and only for
 *    machine literals.
 *  - Chrome comes from the shared `controlClass` in `Field.tsx`, so a re-skin
 *    of the input box re-skins the select. Wrap it in `<Field label=… error=…>`
 *    to get the micro-label and the invalid state.
 */
export const Select = forwardRef<HTMLSelectElement, SelectProps>(function Select(
    { className, value, onChange, options, code = false, density = "default", disabled, ...rest },
    ref,
) {
    return (
        <div className="relative w-full">
            <select
                ref={ref}
                value={value}
                disabled={disabled}
                onChange={(event) => onChange(event.target.value)}
                className={cn(
                    "ui-control",
                    controlClass,
                    controlDensity[density],
                    // The shared chrome is mono (it dresses <Input>); a select reads
                    // as prose unless its values ARE machine literals. cn() lets the
                    // later font utility win.
                    code ? "font-code" : "font-sans",
                    "pr-8 cursor-pointer appearance-none",
                    "disabled:bg-paper-2 disabled:text-dim disabled:cursor-not-allowed",
                    className,
                )}
                {...rest}
            >
                {options.map((option) => (
                    <option key={option.value} value={option.value}>
                        {option.label}
                    </option>
                ))}
            </select>
            <ChevronDown
                aria-hidden
                className="right-2 size-4 text-dim pointer-events-none absolute top-1/2 -translate-y-1/2"
            />
        </div>
    );
});
