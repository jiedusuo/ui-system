"use client";

import { useEffect, useState, type ReactNode } from "react";

import { cn } from "../lib/cn";

export interface ModalProps {
    open: boolean;
    onClose: () => void;
    /** Mono kicker above the title (e.g. product name). */
    kicker?: ReactNode;
    title?: ReactNode;
    children: ReactNode;
    /** Max width of the dialog; defaults to 37.5rem (≈600px). */
    width?: string;
    className?: string;
    /** id of the element labelling the dialog (for aria-labelledby). */
    labelledBy?: string;
    /** When false, scrim-click and Escape do NOT close (for confirmations
     * that must be resolved by an explicit action). Defaults to true. */
    dismissable?: boolean;
}

/**
 * Wired editorial dialog with motion: the scrim fades and the dialog rises
 * (motion.css → `.scrim` / `.dialog`); on phone it becomes a near-full-screen
 * sheet that slides up with a sticky action bar (give the action row the
 * `dialog-actions` class). Mounts/animates in, animates out before unmount,
 * locks body scroll, closes on Escape and on a scrim click. All motion is
 * reduced-motion-gated.
 */
export function Modal({
    open,
    onClose,
    kicker,
    title,
    children,
    width = "37.5rem",
    className,
    labelledBy,
    dismissable = true,
}: ModalProps) {
    const [mounted, setMounted] = useState(open);
    const [show, setShow] = useState(false);

    // Safety: always restore body scroll if the modal unmounts while open
    // (e.g. the host stops rendering it instead of toggling `open`).
    useEffect(() => () => {
        document.body.style.overflow = "";
    }, []);

    useEffect(() => {
        if (open) {
            setMounted(true);
            document.body.style.overflow = "hidden";
            // Two rAFs so the enter transition runs from the hidden state.
            let raf2 = 0;
            const raf1 = requestAnimationFrame(() => {
                raf2 = requestAnimationFrame(() => setShow(true));
            });
            return () => {
                cancelAnimationFrame(raf1);
                cancelAnimationFrame(raf2);
            };
        }
        setShow(false);
        const t = setTimeout(() => setMounted(false), 240);
        document.body.style.overflow = "";
        return () => clearTimeout(t);
    }, [open]);

    useEffect(() => {
        if (!mounted || !dismissable) return;
        const onKey = (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose();
        };
        document.addEventListener("keydown", onKey);
        return () => document.removeEventListener("keydown", onKey);
    }, [mounted, onClose, dismissable]);

    if (!mounted) return null;

    return (
        <div
            className="scrim"
            data-open={show ? "true" : "false"}
            onMouseDown={(e) => {
                if (dismissable && e.target === e.currentTarget) onClose();
            }}
        >
            <div
                role="dialog"
                aria-modal="true"
                aria-labelledby={labelledBy}
                className={cn("ui-modal", "dialog", className)}
                style={{ "--dialog-max": width } as React.CSSProperties}
            >
                {(kicker || title) && (
                    <div className="ui-modal-head flex items-center justify-between gap-stack-lg border-b-2 border-ink bg-paper-2 px-surface-x py-panel-y">
                        <div className="grid gap-stack-xs">
                            {kicker && (
                                <span className="font-sans text-mini uppercase tracking-caps-loose text-muted">
                                    {kicker}
                                </span>
                            )}
                            {title && (
                                <span className="font-display text-pnl font-extrabold leading-none">
                                    {title}
                                </span>
                            )}
                        </div>
                        <button
                            type="button"
                            aria-label="关闭"
                            onClick={onClose}
                            className="ui-modal-close grid size-8 shrink-0 place-items-center border border-ink bg-paper text-ink transition-colors hover:bg-ink hover:text-paper"
                        >
                            <span aria-hidden className="text-base leading-none">
                                ✕
                            </span>
                        </button>
                    </div>
                )}
                {children}
            </div>
        </div>
    );
}
