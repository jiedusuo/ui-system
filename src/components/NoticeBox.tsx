import type { HTMLAttributes, ReactNode } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { CircleX, Info, TriangleAlert, type LucideIcon } from "lucide-react";

import { cn } from "../lib/cn";

const noticeBox = cva("border-2 bg-paper", {
    variants: {
        tone: {
            danger: "border-negative",
            primary: "border-primary",
            neutral: "border-rule",
            info: "border-info",
            warning: "border-ochre",
            error: "border-negative",
        },
    },
    defaultVariants: { tone: "danger" },
});

const noticeBand = cva(
    "flex items-center gap-control-compact-x px-panel py-control-y font-sans text-meta font-bold uppercase tracking-caps",
    {
        variants: {
            tone: {
                danger: "bg-negative text-paper",
                primary: "bg-primary text-paper",
                neutral: "border-b border-rule bg-paper-2 text-ink",
                info: "bg-info text-paper",
                warning: "bg-tint-warn text-tint-warn-ink",
                error: "bg-negative text-paper",
            },
        },
        defaultVariants: { tone: "danger" },
    },
);

const noticeMark = cva(
    "inline-grid size-5 flex-none place-items-center leading-none",
    {
        variants: {
            tone: {
                danger: "text-paper",
                primary: "text-paper",
                neutral: "text-ink",
                info: "text-paper",
                warning: "text-tint-warn-ink",
                error: "text-paper",
            },
        },
        defaultVariants: { tone: "danger" },
    },
);

const noticeBody = cva("grid gap-stack-md px-panel py-panel", {
    variants: {
        tone: {
            danger: "bg-tint-negative",
            primary: "bg-tint-primary",
            neutral: "bg-paper",
            info: "bg-tint-info",
            warning: "bg-tint-warn",
            error: "bg-tint-negative",
        },
    },
    defaultVariants: { tone: "danger" },
});

const noticeStrong = cva("m-0 border-t pt-3 font-sans text-base font-bold leading-7", {
    variants: {
        tone: {
            danger: "border-negative text-negative",
            primary: "border-primary text-primary",
            neutral: "border-rule text-ink",
            info: "border-info text-info-2",
            warning: "border-ochre text-tint-warn-ink",
            error: "border-negative text-negative",
        },
    },
    defaultVariants: { tone: "danger" },
});

export interface NoticeBoxProps
    extends Omit<HTMLAttributes<HTMLElement>, "title">,
        VariantProps<typeof noticeBox> {
    title: ReactNode;
    mark?: ReactNode;
    items?: readonly ReactNode[];
    strong?: ReactNode;
    children?: ReactNode;
}

const toneIcons: Record<NonNullable<NoticeBoxProps["tone"]>, LucideIcon> = {
    danger: TriangleAlert,
    primary: Info,
    neutral: Info,
    info: Info,
    warning: TriangleAlert,
    error: CircleX,
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
    const resolvedTone = tone ?? "danger";
    const ToneIcon = toneIcons[resolvedTone];
    const resolvedMark = mark === undefined
        ? <ToneIcon className="size-4" strokeWidth={2} />
        : mark;
    return (
        <aside
            className={cn("ui-notice", `ui-notice--${resolvedTone}`, noticeBox({ tone: resolvedTone }), className)}
            role="note"
            {...props}
        >
            <p className={cn("ui-notice-band", noticeBand({ tone: resolvedTone }))}>
                {resolvedMark ? (
                    <span className={cn("ui-notice-mark", noticeMark({ tone: resolvedTone }))} aria-hidden>
                        {resolvedMark}
                    </span>
                ) : null}
                <span>{title}</span>
            </p>
            <div className={noticeBody({ tone: resolvedTone })}>
                {items?.length ? (
                    <ul className="m-0 grid gap-2 p-0 font-sans text-sm leading-7 text-ink">
                        {items.map((item, index) => (
                            <li key={index} className="flex gap-2">
                                <span className="mt-2 size-1.5 flex-none bg-current text-negative" aria-hidden />
                                <span>{item}</span>
                            </li>
                        ))}
                    </ul>
                ) : null}
                {children}
                {strong ? <p className={noticeStrong({ tone: resolvedTone })}>{strong}</p> : null}
            </div>
        </aside>
    );
}
