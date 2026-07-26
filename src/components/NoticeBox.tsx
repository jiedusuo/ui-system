import type { HTMLAttributes, ReactNode } from "react";
import { cva } from "class-variance-authority";
import { CircleCheck, CircleX, Info, TriangleAlert, type LucideIcon } from "lucide-react";

import { cn } from "../lib/cn";
import type { SemanticTone } from "../lib/semantic-tone";

const noticeBox = cva("border-2 bg-paper", {
    variants: {
        tone: {
            neutral: "border-rule",
            info: "border-info",
            success: "border-ok",
            warning: "border-ochre",
            error: "border-negative",
        },
    },
});

const noticeBand = cva(
    "flex items-center gap-control-compact-x px-panel py-control-y font-sans text-meta font-bold uppercase tracking-caps",
    {
        variants: {
            tone: {
                neutral: "border-b border-rule bg-paper-2 text-ink",
                info: "bg-info text-paper",
                success: "bg-ok text-paper",
                warning: "bg-tint-warn text-tint-warn-ink",
                error: "bg-negative text-paper",
            },
        },
    },
);

const noticeMark = cva(
    "inline-grid size-5 flex-none place-items-center leading-none",
    {
        variants: {
            tone: {
                neutral: "text-ink",
                info: "text-paper",
                success: "text-paper",
                warning: "text-tint-warn-ink",
                error: "text-paper",
            },
        },
    },
);

const noticeBody = cva("grid gap-stack-md px-panel py-panel", {
    variants: {
        tone: {
            neutral: "bg-paper",
            info: "bg-tint-info",
            success: "bg-tint-ok",
            warning: "bg-tint-warn",
            error: "bg-tint-negative",
        },
    },
});

const noticeStrong = cva("m-0 border-t pt-3 font-sans text-base font-bold leading-7", {
    variants: {
        tone: {
            neutral: "border-rule text-ink",
            info: "border-info text-info-2",
            success: "border-ok text-ok-2",
            warning: "border-ochre text-tint-warn-ink",
            error: "border-negative text-negative",
        },
    },
});

export interface NoticeBoxProps
    extends Omit<HTMLAttributes<HTMLElement>, "title"> {
    tone: SemanticTone;
    title: ReactNode;
    mark?: ReactNode;
    items?: readonly ReactNode[];
    strong?: ReactNode;
    children?: ReactNode;
}

const toneIcons: Record<SemanticTone, LucideIcon> = {
    neutral: Info,
    info: Info,
    success: CircleCheck,
    warning: TriangleAlert,
    error: CircleX,
};
const toneBullet: Record<SemanticTone, string> = {
    neutral: "text-ink",
    info: "text-info-2",
    success: "text-ok-2",
    warning: "text-tint-warn-ink",
    error: "text-negative",
};

export function NoticeBox({
    title,
    mark,
    items,
    strong,
    children,
    tone,
    className,
    ...props
}: NoticeBoxProps) {
    const ToneIcon = toneIcons[tone];
    const resolvedMark = mark === undefined
        ? <ToneIcon className="size-4" strokeWidth={2} />
        : mark;
    return (
        <aside
            className={cn("ui-notice", `ui-notice--${tone}`, noticeBox({ tone }), className)}
            role="note"
            {...props}
        >
            <p className={cn("ui-notice-band", noticeBand({ tone }))}>
                {resolvedMark ? (
                    <span className={cn("ui-notice-mark", noticeMark({ tone }))} aria-hidden>
                        {resolvedMark}
                    </span>
                ) : null}
                <span>{title}</span>
            </p>
            <div className={noticeBody({ tone })}>
                {items?.length ? (
                    <ul className="m-0 grid gap-2 p-0 font-sans text-sm leading-7 text-ink">
                        {items.map((item, index) => (
                            <li key={index} className="flex gap-2">
                                <span
                                    className={cn(
                                        "mt-2 size-1.5 flex-none bg-current",
                                        toneBullet[tone],
                                    )}
                                    aria-hidden
                                />
                                <span>{item}</span>
                            </li>
                        ))}
                    </ul>
                ) : null}
                {children}
                {strong ? <p className={noticeStrong({ tone })}>{strong}</p> : null}
            </div>
        </aside>
    );
}
