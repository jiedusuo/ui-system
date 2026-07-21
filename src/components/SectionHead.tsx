// Section header — a tracked-mono meta string flush right, sitting
// above either a 3px thick rule (top-level) or a hairline rule
// (sub-section).
//
// On the public site the rule IS the section break, so no title is passed and
// none renders. The operator console names its sections (「采集器」,「口令网关」)
// and passes `title` — one header, two surfaces, no second component.

import type { ReactNode } from "react";

interface Props {
    /** Section name, flush left. Omit it and the rule alone is the break. */
    title?: ReactNode;
    /** Right-aligned meta line in mono uppercase. Optional. */
    meta?: ReactNode;
    /** Sub-section style — hairline rule, less padding. */
    sub?: boolean;
    /** Wrap-around space below the rule before the next block. */
    className?: string;
}

export function SectionHead({ title, meta, sub, className }: Props) {
    return (
        <div
            className={["section-head", sub ? "section-head--sub" : "", className ?? ""].join(" ")}
        >
            {title && <h2 className="font-display text-card-title text-ink m-0">{title}</h2>}
            {meta && <span className="section-meta">{meta}</span>}
        </div>
    );
}

/** Container that adds the standard 40px top margin between sections. */
export function Section({ children, className }: { children: ReactNode; className?: string }) {
    return <section className={["mt-10", className ?? ""].join(" ")}>{children}</section>;
}
