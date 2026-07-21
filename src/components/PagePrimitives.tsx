"use client";

import type {
    AnchorHTMLAttributes,
    ButtonHTMLAttributes,
    ImgHTMLAttributes,
    ReactNode,
} from "react";

import { cn } from "../lib/cn";
import { Button } from "./Button";
import { StatusDot } from "./StatusStrip";

const monoCap = "font-sans uppercase tracking-caps";

export interface PageIntroProps {
    kicker?: ReactNode;
    title: ReactNode;
    lede?: ReactNode;
    meta?: ReactNode;
    className?: string;
}

export function PageIntro({ kicker, title, lede, meta, className }: PageIntroProps) {
    return (
        <header className={cn("mb-5", className)}>
            <div className="mb-1.5 gap-x-6 gap-y-4 flex flex-wrap items-end justify-between">
                <div>
                    {kicker && (
                        <span className="mb-2 font-sans text-primary text-mini tracking-caps-x-loose block uppercase">
                            {kicker}
                        </span>
                    )}
                    <h2 className="m-0 font-display text-page-title text-ink leading-none">
                        {title}
                    </h2>
                </div>
                {meta}
            </div>
            {lede && (
                <p className="mb-0 font-sans text-page-lede text-muted max-w-[60ch] leading-[1.65]">
                    {lede}
                </p>
            )}
        </header>
    );
}

export function PageStatusMeta({ children }: { children: ReactNode }) {
    return (
        // `ui-page-meta` is the inert hook the operator skin uses to drop the
        // uppercase: this line reads 「30s 前刷新」 there, and the transform does
        // nothing to the Han while mangling the literal into 30S.
        <span className="ui-page-meta gap-2 pb-1 font-sans text-muted text-mini tracking-caps-x-loose inline-flex items-center uppercase [font-variant-numeric:tabular-nums]">
            <span className="border-ok bg-ok size-[0.4375rem] shrink-0 rounded-full border" />
            {children}
        </span>
    );
}

export interface ContentRailLayoutProps {
    children: ReactNode;
    rail: ReactNode;
    railLabel?: string;
    className?: string;
    contentClassName?: string;
    railClassName?: string;
}

export function ContentRailLayout({
    children,
    rail,
    railLabel,
    className,
    contentClassName,
    railClassName,
}: ContentRailLayoutProps) {
    // The rail (filters/author picker) comes first in the DOM so the
    // single-column mobile layout shows it on top; on lg the explicit
    // grid placement keeps content left, rail right.
    return (
        <div
            className={cn(
                "ui-content-rail",
                "gap-6 border-t-rule pt-6 lg:grid-cols-[minmax(0,1fr)_20rem] lg:gap-[clamp(1.75rem,4vw,3.25rem)] grid grid-cols-1 items-start border-t-[length:var(--border-rule-thick)]",
                className,
            )}
        >
            <aside
                className={cn(
                    "ui-content-rail__aside",
                    "min-w-0 lg:sticky lg:top-3 lg:col-start-2 lg:row-start-1",
                    railClassName,
                )}
                aria-label={railLabel}
            >
                {rail}
            </aside>
            <div
                className={cn(
                    "ui-content-rail__content",
                    "min-w-0 lg:col-start-1 lg:row-start-1",
                    contentClassName,
                )}
            >
                {children}
            </div>
        </div>
    );
}

export function FeedFrame({
    busy,
    children,
    className,
}: {
    busy?: boolean;
    children: ReactNode;
    className?: string;
}) {
    return (
        <div className={cn("min-h-32 relative", className)} aria-busy={busy}>
            {busy && (
                <span
                    className="inset-x-0 top-0 h-0.5 animate-pulse bg-ochre absolute"
                    aria-hidden
                />
            )}
            {children}
        </div>
    );
}

export function FeedSkeleton({
    rows = 6,
    label,
    className,
}: {
    rows?: number;
    label?: string;
    className?: string;
}) {
    return (
        <div className={cn("grid", className)} role="status" aria-live="polite" aria-label={label}>
            {Array.from({ length: Math.max(1, rows) }, (_, i) => (
                <div
                    key={i}
                    className={cn(
                        "gap-4 border-rule-soft py-3.5 grid grid-cols-[4.75rem_1fr] border-t first:border-t-0",
                        i > 3 ? "opacity-45" : i > 1 ? "opacity-70" : undefined,
                    )}
                    aria-hidden
                >
                    <span className="h-3 animate-pulse bg-rule-soft/45" />
                    <span className="gap-1.5 grid content-start">
                        <span className="h-3 animate-pulse bg-rule-soft/45 w-2/5" />
                        <span className="h-4 animate-pulse bg-rule-soft/45 w-full" />
                        <span
                            className={cn(
                                "h-4 animate-pulse bg-rule-soft/45",
                                i % 2 ? "w-1/2" : "w-3/4",
                            )}
                        />
                    </span>
                </div>
            ))}
        </div>
    );
}

export function FadeWhileBusy({ busy, children }: { busy?: boolean; children: ReactNode }) {
    return (
        <div
            className={cn(
                "transition-[filter,opacity] duration-200",
                busy && "opacity-60 saturate-[.82]",
            )}
        >
            {children}
        </div>
    );
}

export interface EmptyStatePanelProps {
    kicker?: ReactNode;
    title: ReactNode;
    body: ReactNode;
    children?: ReactNode;
    className?: string;
}

export function EmptyStatePanel({
    kicker,
    title,
    body,
    children,
    className,
}: EmptyStatePanelProps) {
    return (
        <div
            className={cn(
                "ui-card",
                "border-rule bg-paper-2 border px-[clamp(1.75rem,4vw,2.75rem)] py-[clamp(1.75rem,4vw,2.75rem)] text-center",
                className,
            )}
        >
            {kicker && (
                <span className="font-sans text-primary text-mini tracking-caps-x-loose uppercase">
                    {kicker}
                </span>
            )}
            <h3 className="my-2.5 font-display text-2xl font-extrabold">{title}</h3>
            <p className="mb-4 font-sans text-muted mx-auto max-w-[34rem] leading-[1.65]">{body}</p>
            {children && (
                <div className="gap-3 flex flex-wrap items-center justify-center">{children}</div>
            )}
        </div>
    );
}

export function TextButton({ className, ...rest }: ButtonHTMLAttributes<HTMLButtonElement>) {
    return (
        <Button
            size="tiny"
            variant="ghost"
            className={cn("text-micro tracking-caps-x-loose", className)}
            {...rest}
        />
    );
}

export function ActionLink({ className, ...rest }: AnchorHTMLAttributes<HTMLAnchorElement>) {
    return (
        <a
            className={cn(
                "ui-actionlink",
                "border-ink bg-ink px-3.5 py-2.5 font-sans !text-paper hover:border-primary hover:bg-primary hover:!text-paper text-mini tracking-caps-x-loose inline-flex items-center justify-center border uppercase !no-underline transition-colors",
                className,
            )}
            {...rest}
        />
    );
}

export function RailSummary({ parts, okIndex }: { parts: readonly string[]; okIndex?: number }) {
    return (
        <div
            className={cn(
                "ui-rail-summary",
                monoCap,
                "mb-3 gap-x-3 gap-y-1 border-rule pb-3 text-muted text-mini flex flex-wrap border-b [font-variant-numeric:tabular-nums]",
            )}
        >
            {parts.map((part, i) => {
                const [num, ...rest] = part.split(" ");
                return (
                    <span key={part} className={i === okIndex ? "text-ok" : undefined}>
                        <b className="font-bold text-ink">{num}</b> {rest.join(" ")}
                    </span>
                );
            })}
        </div>
    );
}

export function RailSection({
    title,
    action,
    children,
}: {
    title: ReactNode;
    action?: ReactNode;
    children: ReactNode;
}) {
    return (
        <section className="ui-rail-section mb-5">
            <div className="mb-2.5 gap-2 flex items-baseline justify-between">
                <span className="font-sans font-bold text-ink text-mini tracking-caps-x-loose uppercase">
                    {title}
                </span>
                {action}
            </div>
            {children}
        </section>
    );
}

export function RailOptionButton({
    active,
    count,
    children,
    className,
    ...rest
}: ButtonHTMLAttributes<HTMLButtonElement> & {
    active?: boolean;
    count?: ReactNode;
}) {
    return (
        <button
            type="button"
            className={cn(
                "gap-2 border-rule-soft px-0.5 py-1.5 font-sans text-mini font-medium text-muted hover:text-ink flex w-full items-baseline justify-between border-t bg-transparent text-left transition-colors first:border-t-0",
                active && "font-semibold text-ink",
                className,
            )}
            {...rest}
        >
            {active && <span className="size-2 bg-primary shrink-0 self-center" aria-hidden />}
            <span className="min-w-0 flex-1">{children}</span>
            {count != null && (
                <span className="font-sans text-mini font-normal text-dim [font-variant-numeric:tabular-nums]">
                    {count}
                </span>
            )}
        </button>
    );
}

export function InlineStatus({
    tone,
    children,
    action,
    className,
}: {
    tone: "ok" | "warn" | "error" | "idle";
    children: ReactNode;
    action?: ReactNode;
    className?: string;
}) {
    const dotTone = tone === "ok" ? "ok" : tone === "warn" ? "warn" : "off";
    return (
        <div
            className={cn(
                monoCap,
                "gap-2 text-muted text-mini inline-flex flex-wrap items-center [font-variant-numeric:tabular-nums]",
                className,
            )}
            aria-live="polite"
        >
            <StatusDot
                tone={dotTone}
                className={cn(
                    "size-[0.4375rem] border bg-transparent",
                    tone === "ok" && "border-ok bg-ok",
                    tone === "warn" && "border-ochre bg-ochre",
                    tone === "error" && "border-negative bg-negative",
                    tone === "idle" && "border-muted",
                )}
            />
            <span className="min-w-0 text-muted">{children}</span>
            {action}
        </div>
    );
}

export function Pager({
    currentPage,
    totalPages,
    labels,
    onPage,
}: {
    currentPage: number;
    totalPages: number;
    labels: {
        firstPage: string;
        prevPage: string;
        nextPage: string;
        lastPage: string;
        page: string;
    };
    onPage: (page: number) => void;
}) {
    const buttonClass =
        "border border-ink bg-paper px-3 py-1.5 font-sans text-mini uppercase tracking-caps-x-loose text-ink transition-colors enabled:hover:bg-ink enabled:hover:text-paper disabled:cursor-default disabled:opacity-[.35]";
    return (
        <nav
            className="mt-3.5 gap-2.5 flex flex-wrap items-center justify-center"
            aria-label={labels.page}
        >
            <button
                type="button"
                className={buttonClass}
                onClick={() => onPage(1)}
                disabled={currentPage <= 1}
                aria-label={labels.firstPage}
            >
                «
            </button>
            <button
                type="button"
                className={buttonClass}
                onClick={() => onPage(currentPage - 1)}
                disabled={currentPage <= 1}
                aria-label={labels.prevPage}
            >
                ‹ {labels.prevPage}
            </button>
            <span
                className={cn(monoCap, "text-muted text-mini [font-variant-numeric:tabular-nums]")}
            >
                {labels.page}
            </span>
            <button
                type="button"
                className={buttonClass}
                onClick={() => onPage(currentPage + 1)}
                disabled={currentPage >= totalPages}
                aria-label={labels.nextPage}
            >
                {labels.nextPage} ›
            </button>
            <button
                type="button"
                className={buttonClass}
                onClick={() => onPage(totalPages)}
                disabled={currentPage >= totalPages}
                aria-label={labels.lastPage}
            >
                »
            </button>
        </nav>
    );
}

export function MetaTag({ children, className }: { children: ReactNode; className?: string }) {
    return (
        <span
            className={cn(
                "border-rule-soft px-1 font-sans text-muted text-micro tracking-caps-x-loose border uppercase",
                className,
            )}
        >
            {children}
        </span>
    );
}

export function MonoNote({
    children,
    tone = "muted",
    variant = "note",
    className,
}: {
    children: ReactNode;
    tone?: "muted" | "warn";
    /** `note` annotates the block above it; `line` is a standalone padded readout. */
    variant?: "note" | "line";
    className?: string;
}) {
    return (
        <div
            className={cn(
                "font-sans tracking-caps",
                variant === "line" ? "py-7 text-mini uppercase" : "mt-1.5 text-mini",
                tone === "warn" ? "text-ochre" : "text-muted",
                className,
            )}
        >
            {children}
        </div>
    );
}

export function SignalMeta({
    action,
    selling,
    confidenceLabel,
    confidence,
    actionClassName,
    children,
}: {
    action: ReactNode;
    selling?: boolean;
    confidenceLabel: ReactNode;
    confidence: ReactNode;
    actionClassName?: string;
    children?: ReactNode;
}) {
    // One full-width wire-slug line: action chip, contract leg, then the
    // confidence pushed to the right edge. The enclosing card's signal
    // backdrop marks the message as an alert — no box-in-box border here.
    return (
        <div className="mt-2.5 gap-x-1.5 gap-y-1 font-sans text-ink text-mini tracking-caps-tight flex w-full flex-wrap items-center [font-variant-numeric:tabular-nums]">
            <span
                className={cn(
                    "bg-primary px-1.5 py-0.5 font-bold text-paper text-mini tracking-caps-loose uppercase",
                    selling && "border-primary bg-paper text-primary border",
                    actionClassName,
                )}
            >
                {action}
            </span>
            {children}
            <span className="pl-2 text-muted text-micro tracking-caps ml-auto whitespace-nowrap uppercase">
                {confidenceLabel} {confidence}
            </span>
        </div>
    );
}

export function PreviewLightbox({
    src,
    alt,
    closeLabel,
    onClose,
    imgProps,
}: {
    src: string;
    alt: string;
    closeLabel: string;
    onClose: () => void;
    imgProps?: Omit<ImgHTMLAttributes<HTMLImageElement>, "src" | "alt">;
}) {
    const { className, ...restImgProps } = imgProps ?? {};

    return (
        <button
            type="button"
            className="inset-0 bg-overlay-strong p-6 fixed z-[1000] flex cursor-zoom-out items-center justify-center border-0 text-inherit"
            aria-label={closeLabel}
            onClick={onClose}
        >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
                className={cn(
                    "border-paper bg-paper max-h-full max-w-full border object-contain",
                    className,
                )}
                src={src}
                alt={alt}
                {...restImgProps}
            />
        </button>
    );
}
