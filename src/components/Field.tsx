"use client";

import {
    cloneElement,
    isValidElement,
    useId,
    type InputHTMLAttributes,
    type ReactElement,
    type ReactNode,
    type TextareaHTMLAttributes,
    forwardRef,
} from "react";

import { cn } from "../lib/cn";

/* Shared control chrome: hairline-ink box on paper, mono text, ink focus
 * ring drawn inside the border so it never shifts layout. Square corners,
 * monochrome — no chromatic accent. Exported so sibling controls (`Select`)
 * wear the same box instead of growing a parallel scale.
 *
 * Invalid and disabled live here, not per-control: they are states of the box,
 * and a family where only one member can look invalid is the defect this row
 * of classes closes. */
export const controlClass =
    "w-full border border-ink bg-paper text-ink outline-none placeholder:text-dim focus:outline-2 focus:-outline-offset-2 focus:outline-ink aria-[invalid=true]:border-negative aria-[invalid=true]:focus:outline-negative disabled:cursor-not-allowed disabled:bg-paper-2 disabled:text-dim";
export const controlDensity = {
    default: "px-control-x py-control-y text-num",
    compact: "px-control-compact-x py-control-compact-y text-label",
} as const;

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
    density?: keyof typeof controlDensity;
    /** Use the code face for machine literals; prose is the default. */
    code?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
    { className, density = "default", code = false, ...rest },
    ref,
) {
    return (
        <input
            ref={ref}
            className={cn(
                "ui-control",
                controlClass,
                controlDensity[density],
                code ? "font-code" : "font-sans",
                className,
            )}
            {...rest}
        />
    );
});

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
    density?: keyof typeof controlDensity;
    /** Use the code face for machine literals or source text; prose is the default. */
    code?: boolean;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(
    { className, density = "default", code = false, ...rest },
    ref,
) {
    return (
        <textarea
            ref={ref}
            className={cn(
                "ui-control",
                controlClass,
                controlDensity[density],
                code ? "font-code" : "font-sans",
                "min-h-16 leading-relaxed resize-y",
                className,
            )}
            {...rest}
        />
    );
});

/** Mono uppercase micro-label (the "kicker" above a field). */
export function Kicker({ children, className }: { children: ReactNode; className?: string }) {
    return (
        <span className={cn("font-sans text-label tracking-caps text-muted uppercase", className)}>
            {children}
        </span>
    );
}

export interface FieldProps {
    label?: ReactNode;
    /** Help/explainer text under the control (mono, muted). */
    help?: ReactNode;
    /** Validation failure. Renders under the control in the negative tone and marks the control invalid. */
    error?: ReactNode;
    children: ReactNode;
    density?: keyof typeof controlDensity;
    className?: string;
}

/**
 * A labelled form row: kicker label, the control, then the error / help text.
 *
 * Hidden contract: `error` is the form family's ONLY invalid state. Setting it
 * clones the wrapped control to carry `aria-invalid` + `aria-describedby`, so
 * the control must be a single element that spreads its props to the DOM node
 * (`Input`, `Textarea`, `Select` all do). Don't hand-roll a red border beside
 * a `NoticeBox` — pass `error` and let the field own the state.
 */
export function Field({
    label,
    help,
    error,
    children,
    density = "default",
    className,
}: FieldProps) {
    const generatedControlId = useId();
    const errorId = useId();
    const helpId = useId();
    const child = isValidElement(children)
        ? (children as ReactElement<Record<string, unknown>>)
        : null;
    const existingId = child?.props.id;
    const controlId = typeof existingId === "string" ? existingId : generatedControlId;
    const describedBy = [
        typeof child?.props["aria-describedby"] === "string"
            ? child.props["aria-describedby"]
            : null,
        error ? errorId : null,
        help ? helpId : null,
    ]
        .filter(Boolean)
        .join(" ") || undefined;
    const control = child
        ? cloneElement(child, {
              id: controlId,
              ...(error ? { "aria-invalid": true } : {}),
              ...(describedBy ? { "aria-describedby": describedBy } : {}),
          })
        : children;
    return (
        <div className={cn("gap-field-gap grid", className)}>
            {label && (
                <label htmlFor={child ? controlId : undefined}>
                    <Kicker className={density === "compact" ? "text-mini" : undefined}>
                        {label}
                    </Kicker>
                </label>
            )}
            {control}
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
}
