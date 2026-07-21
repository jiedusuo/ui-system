"use client";

import { useEffect, useState, type ReactNode } from "react";

import { cn } from "../lib/cn";

export interface SectionNavItem {
    id: string;
    label: string;
    serial?: string;
    dot?: boolean;
    dotTitle?: string;
}

export interface SectionNavGroup {
    eyebrow?: string;
    label?: string;
    items: SectionNavItem[];
}

export interface SectionNavProps {
    title?: string;
    items?: SectionNavItem[];
    groups?: SectionNavGroup[];
    offset?: number;
    ariaLabel?: string;
    className?: string;
}

function allItems(items?: SectionNavItem[], groups?: SectionNavGroup[]): SectionNavItem[] {
    if (items) return items;
    if (groups) return groups.flatMap((g) => g.items);
    return [];
}

export function SectionNav({
    title,
    items,
    groups,
    offset = 80,
    ariaLabel,
    className,
}: SectionNavProps) {
    const flat = allItems(items, groups);
    const [activeId, setActiveId] = useState<string>(flat[0]?.id ?? "");

    useEffect(() => {
        if (typeof IntersectionObserver === "undefined") return;
        const ids = flat.map((i) => i.id);
        const els = ids
            .map((id) => document.getElementById(id))
            .filter((el): el is HTMLElement => el !== null);
        if (!els.length) return;
        const ratios = new Map<string, number>(ids.map((id) => [id, 0]));
        const observer = new IntersectionObserver(
            (entries) => {
                for (const entry of entries) {
                    ratios.set(entry.target.id, entry.intersectionRatio);
                }
                let best: string | undefined;
                let bestRatio = -1;
                for (const id of ids) {
                    const r = ratios.get(id) ?? 0;
                    if (r > bestRatio) {
                        bestRatio = r;
                        best = id;
                    }
                }
                if (best !== undefined) setActiveId(best);
            },
            { rootMargin: "-20% 0px -60% 0px", threshold: [0, 0.25, 0.5, 0.75, 1] },
        );
        for (const el of els) observer.observe(el);
        return () => observer.disconnect();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [flat.map((i) => i.id).join("|")]);

    const jump = (id: string) => {
        if (typeof document === "undefined") return;
        const el = document.getElementById(id);
        if (!el) return;
        const top = el.getBoundingClientRect().top + window.scrollY - offset;
        window.scrollTo({ top, behavior: "smooth" });
        setActiveId(id);
    };

    const renderItem = (item: SectionNavItem): ReactNode => {
        const active = item.id === activeId;
        return (
            <button
                key={item.id}
                type="button"
                className={cn(
                    "ui-section-nav__item",
                    "group gap-2 px-3.5 py-1.5 hover:border-rule-soft hover:bg-paper-2 max-[900px]:ml-0 max-[900px]:px-2.5 max-[900px]:py-1.5 [@media(max-width:900px)_and_(pointer:coarse)]:min-h-11 [@media(max-width:900px)_and_(pointer:coarse)]:py-2 ml-[-1px] flex w-full cursor-pointer items-center border-0 border-l-2 border-transparent bg-transparent text-left transition-colors max-[900px]:w-auto max-[900px]:border-b-2 max-[900px]:border-l-0",
                    active &&
                        "border-primary bg-tint-primary max-[900px]:border-b-primary max-[900px]:border-l-transparent",
                )}
                onClick={() => jump(item.id)}
                aria-current={active ? "location" : undefined}
            >
                {item.serial && (
                    <span className="font-sans text-muted shrink-0 text-[0.6875rem] [font-variant-numeric:tabular-nums]">
                        {item.serial}
                    </span>
                )}
                <span
                    className={cn(
                        "min-w-0 font-sans font-normal text-muted group-hover:text-ink flex-1 text-[0.7188rem] tracking-[0.04em]",
                        active && "text-primary",
                    )}
                >
                    {item.label}
                </span>
                {item.dot != null && (
                    <span
                        className={cn(
                            "size-[0.4375rem] shrink-0 rounded-full",
                            item.dot
                                ? "border-ok bg-ok border"
                                : "border-rule-soft border bg-transparent",
                        )}
                        data-tooltip={item.dotTitle}
                    />
                )}
            </button>
        );
    };

    return (
        <nav
            className={cn(
                "ui-section-nav",
                // The sticky offset has to clear whatever sits above it. A
                // surface with a STICKY masthead must set `--section-nav-top`
                // to at least its header height, or the index scrolls up and
                // disappears underneath it (the header wins the z-index). The
                // fallback is the old bare-viewport offset, so surfaces with a
                // static header are unaffected.
                "border-rule pb-4 max-[900px]:pb-2 sticky top-[var(--section-nav-top,1.125rem)] max-h-[calc(100vh-var(--section-nav-top,1.125rem)-1.125rem)] self-start overflow-y-auto border-l [scrollbar-color:var(--rule-soft)_transparent] [scrollbar-width:thin] max-[900px]:static max-[900px]:max-h-none max-[900px]:border-b max-[900px]:border-l-0",
                className,
            )}
            aria-label={ariaLabel ?? title}
        >
            <div className="gap-0.5 max-[900px]:gap-x-1 max-[900px]:gap-y-0.5 flex flex-col max-[900px]:flex-row max-[900px]:flex-wrap">
                {title && (
                    <div className="ui-section-nav__title mb-0.5 border-ink py-1 pl-3 font-sans text-primary max-[900px]:ml-0 max-[900px]:pl-0 ml-[-1px] border-l-[var(--rule-thick)] text-[0.625rem] tracking-[0.18em] uppercase max-[900px]:basis-full max-[900px]:border-l-0">
                        {title}
                    </div>
                )}
                {groups
                    ? groups.map((g, gi) => (
                          <div
                              className="ui-section-nav__group gap-0.5 first:mt-0 max-[900px]:mt-0 max-[900px]:gap-x-1 max-[900px]:gap-y-0.5 mt-[1.125rem] flex flex-col max-[900px]:flex-row max-[900px]:flex-wrap max-[900px]:items-baseline"
                              key={g.label ?? g.eyebrow ?? gi}
                          >
                              {(g.eyebrow || g.label) && (
                                  <div className="ui-section-nav__group-title gap-1 border-ink py-1 pl-3 max-[900px]:ml-0 max-[900px]:px-2 max-[900px]:py-1.5 ml-[-1px] grid border-l-[var(--rule-thick)] max-[900px]:border-l-0">
                                      {g.eyebrow && (
                                          <span className="font-sans text-primary text-[0.625rem] tracking-[0.18em] uppercase">
                                              {g.eyebrow}
                                          </span>
                                      )}
                                      {g.label && (
                                          <span className="font-serif-cn font-extrabold leading-tight text-[0.9375rem]">
                                              {g.label}
                                          </span>
                                      )}
                                  </div>
                              )}
                              <div className="max-[900px]:gap-x-1 max-[900px]:gap-y-0.5 flex flex-col gap-px max-[900px]:flex-row max-[900px]:flex-wrap">
                                  {g.items.map(renderItem)}
                              </div>
                          </div>
                      ))
                    : flat.map(renderItem)}
            </div>
        </nav>
    );
}
