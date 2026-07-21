import type { HTMLAttributes, ReactNode } from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "../lib/cn";

/* `Badge` and `StatusBadge` are a deliberate PAIR, and they live in one file
 * so nobody reaches for the wrong half. The old admin `Badge` conflated the
 * two jobs — it carried both "parser=enrich_v3" and "引擎运行中" — which is how
 * status ended up wearing the brand accent and metadata ended up looking
 * alarming. The redesign splits them:
 *
 *   Badge        METADATA. A tag on a thing: a parser key, a channel, a plan,
 *                a count. Neutral unless the caller has a reason.
 *   StatusBadge  SEMANTIC STATUS. Is this thing healthy right now? Only four
 *                answers, and they are colour-coded by MEANING.
 *
 * Hard rule from the visual spec: status colour NEVER rides the brand accent.
 * That is why `StatusBadge` has no `accent` tone and never will — a "connected"
 * badge must read green even on a surface whose accent is vermilion. */

const badge = cva(
    "inline-flex items-center gap-1 whitespace-nowrap rounded-full border px-2 py-0.5 leading-snug font-semibold text-meta",
    {
        variants: {
            tone: {
                neutral: "border-rule bg-paper text-muted",
                accent: "border-primary/40 bg-tint-primary text-primary",
                ok: "border-ok/40 bg-ok/10 text-ok-2",
                warn: "border-ochre/40 bg-ochre/10 text-ochre",
                err: "border-negative/40 bg-negative/10 text-negative-2",
            },
            code: {
                true: "font-code tracking-normal",
                false: "font-sans",
            },
        },
        defaultVariants: { tone: "neutral", code: false },
    },
);

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement>, VariantProps<typeof badge> {}

/**
 * Metadata tag — a small tinted pill that labels a thing. Use it for facets you
 * would put in a WHERE clause: parser key, channel, source, plan, kind, count.
 *
 * Hidden contract:
 *  - It is NOT a status light. If the pill answers "is this healthy / running /
 *    failing right now", you want `StatusBadge`, whose colours mean something.
 *    A tone here is emphasis, not a health claim: `neutral` is the default and
 *    the right answer for almost every tag; `accent` marks the one tag that
 *    belongs to the current selection; `ok`/`warn`/`err` are for tags whose
 *    *category* is inherently good/risky/bad (e.g. 已撤销), not for liveness.
 *  - Pass `code` when the pill's text is a machine literal (`enrich_v3`,
 *    `OPEN`, an id). That is what Geist Mono is for, and the only thing.
 *  - Chinese copy never gets uppercase/tracking treatment, so this pill is
 *    sentence-case by design — do not add `uppercase` in `className`.
 */
export function Badge({ className, tone, code, ...rest }: BadgeProps) {
    return <span className={cn("ui-badge", badge({ tone, code }), className)} {...rest} />;
}

const statusBadge = cva("inline-flex items-center gap-1.5 font-sans text-value font-semibold", {
    variants: {
        tone: {
            ok: "text-ok-2",
            warn: "text-ochre",
            err: "text-negative-2",
            idle: "text-muted",
        },
    },
    defaultVariants: { tone: "idle" },
});

const statusDot = cva("size-2 flex-none rounded-full", {
    variants: {
        tone: {
            ok: "bg-ok text-ok",
            warn: "bg-ochre text-ochre",
            err: "bg-negative text-negative",
            idle: "bg-dim text-dim",
        },
    },
    defaultVariants: { tone: "idle" },
});

export interface StatusBadgeProps extends HTMLAttributes<HTMLSpanElement> {
    tone: "ok" | "warn" | "err" | "idle";
    /** Pulse the dot — ONLY for a healthy thing that is genuinely connected right now. */
    live?: boolean;
    children: ReactNode;
}

/**
 * Semantic status — a coloured dot plus the word, and nothing else. Use it
 * wherever the operator's question is "is this thing OK right now": engine,
 * relay, stream, token, job.
 *
 * Hidden contract:
 *  - Four tones, four meanings: `ok` (running / connected / resolved), `warn`
 *    (degraded / pending / expiring), `err` (down / rejected / failed), `idle`
 *    (stopped on purpose — grey, not red; a paused engine is not a broken one).
 *    There is deliberately NO accent tone: status must never ride the brand
 *    colour, or a red-accent surface turns every healthy badge into an alarm.
 *  - `live` pulses the dot and is a claim about the present tense — a live
 *    socket, a heartbeat inside its window. Never set it on a value that was
 *    merely fetched once. It rides the base.css `.live-ping` class, which is
 *    already gated by `prefers-reduced-motion`, so the pulse disappears for
 *    users who asked for that; the dot's colour still carries the meaning.
 *  - The child is the WORD (运行中 / 已停止 / 心跳超时) — Chinese, sentence-case,
 *    never uppercase-tracked. Metadata tags are `Badge`, not this.
 */
export function StatusBadge({
    className,
    tone,
    live = false,
    children,
    ...rest
}: StatusBadgeProps) {
    return (
        <span className={cn("ui-status-badge", statusBadge({ tone }), className)} {...rest}>
            <span className={cn(statusDot({ tone }), live && "live-ping")} aria-hidden />
            {children}
        </span>
    );
}
