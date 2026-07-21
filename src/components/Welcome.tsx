// First-run hero block: 64px serif headline with ink accent +
// editorial body copy + flat black CTA button. Renders only when
// no config exists yet.

import Link from "next/link";
import type { ReactNode } from "react";

interface Props {
    /** Headline split into plain + accent parts ("欢迎使用 <accent>赚钱所</accent>"). */
    headline: ReactNode;
    accent: ReactNode;
    body: ReactNode;
    ctaHref: string;
    ctaLabel: ReactNode;
}

export function Welcome({ headline, accent, body, ctaHref, ctaLabel }: Props) {
    return (
        <section className="page-fade mt-20 grid grid-cols-2 items-center gap-15">
            <h1 className="m-0 font-serif-cn text-hero font-black leading-tight tracking-normal">
                {headline}
                <span className="text-ink">{accent}</span>
            </h1>
            <div>
                <p className="font-display text-body leading-relaxed text-muted">{body}</p>
                <Link
                    href={ctaHref}
                    className="mt-6 inline-block bg-ink px-7 py-4 font-display text-cta font-semibold text-paper no-underline"
                >
                    {ctaLabel} <span className="ml-2 font-sans">→</span>
                </Link>
            </div>
        </section>
    );
}
