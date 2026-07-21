"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "../lib/cn";

export interface SideNavItem {
    href: string;
    num: string;
    label: string;
}

interface Props {
    items: SideNavItem[];
    ariaLabel?: string;
    homeMatch?: (pathname: string) => boolean;
    className?: string;
}

export function SideNav({ items, ariaLabel = "Navigation", homeMatch, className }: Props) {
    const pathname = usePathname() || "/";

    function isActive(href: string, index: number): boolean {
        if (href === "/") {
            return homeMatch ? homeMatch(pathname) : pathname === "/";
        }
        // The bare root (`/`) is the home page, which renders the first nav
        // item's screen — so highlight that item there (no item has href "/").
        if (pathname === "/") return index === 0;
        return pathname === href || pathname.startsWith(href + "/");
    }

    return (
        <nav
            aria-label={ariaLabel}
            className={cn(
                "ui-sidenav",
                "sticky top-4 max-[900px]:static max-[900px]:mb-5",
                className,
            )}
        >
            <ol className="m-0 grid list-none gap-1 p-0 max-[900px]:grid-cols-4 max-[900px]:gap-1.5 max-[600px]:grid-cols-2">
                {items.map((it, index) => {
                    const active = isActive(it.href, index);
                    return (
                        <li key={it.href}>
                            <Link
                                href={it.href}
                                prefetch={false}
                                className={cn(
                                    "ui-sidenav-item",
                                    "grid min-h-[2.35rem] grid-cols-[2.7rem_minmax(0,1fr)] items-baseline gap-2",
                                    "border-l-[2px] border-l-transparent px-2 py-1.5 no-underline",
                                    "font-display text-[1.05rem] font-medium leading-[1.15] text-muted",
                                    "hover:text-ink focus-visible:text-ink focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-2 focus-visible:outline-ink",
                                    "data-[active=true]:border-l-ink data-[active=true]:bg-paper-2 data-[active=true]:text-ink",
                                    "max-[900px]:min-h-[2.25rem] max-[900px]:grid-cols-[auto_minmax(0,1fr)] max-[900px]:gap-1.5 max-[900px]:text-[0.98rem]",
                                    "max-[600px]:min-h-[2.2rem] max-[600px]:text-[0.95rem]",
                                )}
                                data-active={active ? "true" : "false"}
                                aria-current={active ? "page" : undefined}
                            >
                                <span
                                    className={cn(
                                        "ui-sidenav-num",
                                        "font-sans text-mini tracking-[0.1em] text-dim",
                                        active && "text-ink",
                                    )}
                                    aria-hidden="true"
                                >
                                    {it.num}
                                </span>
                                <span className="min-w-0 break-words">{it.label}</span>
                            </Link>
                        </li>
                    );
                })}
            </ol>
        </nav>
    );
}
