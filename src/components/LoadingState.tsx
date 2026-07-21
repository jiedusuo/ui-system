import type { ReactNode } from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "../lib/cn";

const loadingFrame = cva("relative overflow-hidden border border-rule bg-paper text-ink", {
    variants: {
        tone: {
            public: "px-[clamp(1.25rem,3vw,2rem)] py-7",
            studio: "px-5 py-5",
            compact: "px-4 py-4",
        },
    },
    defaultVariants: {
        tone: "studio",
    },
});

const loadingLine = cva("block animate-pulse bg-rule-soft/45", {
    variants: {
        width: {
            wide: "w-full",
            mid: "w-2/3",
            short: "w-2/5",
        },
        height: {
            title: "h-5",
            body: "h-3",
            row: "h-10",
        },
    },
    defaultVariants: {
        width: "wide",
        height: "body",
    },
});

export interface PageLoadingProps extends VariantProps<typeof loadingFrame> {
    kicker?: ReactNode;
    title: ReactNode;
    body?: ReactNode;
    rows?: number;
    ariaLabel?: string;
    className?: string;
}

export function PageLoading({
    kicker,
    title,
    body,
    rows = 4,
    ariaLabel,
    tone,
    className,
}: PageLoadingProps) {
    return (
        <section
            className={cn(loadingFrame({ tone }), className)}
            role="status"
            aria-live="polite"
            aria-label={ariaLabel}
        >
            <div className="gap-5 md:grid-cols-[minmax(0,0.72fr)_minmax(18rem,1fr)] md:items-end grid">
                <div className="min-w-0">
                    {kicker && (
                        <p className="mb-2 font-sans text-mini tracking-caps-loose text-primary uppercase">
                            {kicker}
                        </p>
                    )}
                    <h2 className="m-0 font-display text-card-title leading-tight text-ink md:text-pnl">
                        {title}
                    </h2>
                    {body && (
                        <p className="mb-0 mt-3 font-sans text-num leading-relaxed text-muted max-w-[48ch]">
                            {body}
                        </p>
                    )}
                </div>
                <div className="min-w-0 gap-2 grid" aria-hidden="true">
                    <span className={loadingLine({ width: "mid", height: "title" })} />
                    {Array.from({ length: Math.max(1, rows) }, (_, i) => (
                        <span
                            key={i}
                            className={cn(
                                loadingLine({
                                    width: i % 3 === 1 ? "mid" : i % 3 === 2 ? "short" : "wide",
                                    height: "row",
                                }),
                                i > 3 ? "opacity-60" : i > 1 ? "opacity-75" : "opacity-90",
                            )}
                        />
                    ))}
                </div>
            </div>
        </section>
    );
}
