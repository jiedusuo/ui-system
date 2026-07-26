// First-run hero block. Renders only when no config exists yet.

import type { ReactNode } from "react";

import { ActionLink } from "./PagePrimitives";

interface Props {
    headline: ReactNode;
    body: ReactNode;
    ctaHref: string;
    ctaLabel: ReactNode;
}

export function Welcome({ headline, body, ctaHref, ctaLabel }: Props) {
    return (
        <section className="page-fade mt-20 grid grid-cols-2 items-center gap-15">
            <h1 className="m-0 font-serif-cn text-hero font-black leading-tight tracking-normal">
                {headline}
            </h1>
            <div>
                <p className="font-display text-body leading-relaxed text-muted">{body}</p>
                <ActionLink
                    href={ctaHref}
                    className="mt-6 gap-3 px-6 py-4 font-display text-cta normal-case tracking-normal"
                >
                    {ctaLabel} <span className="ml-2 font-sans">→</span>
                </ActionLink>
            </div>
        </section>
    );
}
