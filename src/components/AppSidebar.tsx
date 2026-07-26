"use client";

// The shared operator nav rail (admin + sunflower). Composes shadcn's
// Sidebar primitives; the per-app data (groups, brand, status, footer) and
// the active-route test arrive as props/slots so this component imports no
// router, locale table, or engine state. Active styling (the primary-soft
// pill + 3px left ribbon) lives in operator.css on the [data-slot] hooks.

import type { ElementType, ReactNode } from "react";
import type { LucideIcon } from "lucide-react";

import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarRail,
} from "../ui/sidebar";

export interface NavItem {
    href: string;
    label: string;
    icon: LucideIcon;
}

export interface NavGroup {
    label: string;
    items: NavItem[];
}

export interface AppSidebarBrand {
    icon: ReactNode;
    title: ReactNode;
    subtitle?: ReactNode;
}

export interface AppSidebarProps {
    groups: NavGroup[];
    /** True when `href` is the active route. The app owns pathname matching
     *  (admin strips its basePath; desktop does not). */
    isActive: (href: string) => boolean;
    /** App-supplied client Link (e.g. next/link). Defaults to a plain <a>. */
    linkComponent?: ElementType;
    /** Structured brand. AppSidebar owns its icon-collapse treatment. */
    brand: AppSidebarBrand;
    /** State-driven apps may navigate without anchors (e.g. a local desktop shell). */
    onNavigate?: (href: string) => void;
    /** Optional status slot under the brand (desktop LivePill / admin badge). */
    status?: ReactNode;
    /** Optional footer slot at the rail bottom (install button + version). */
    footer?: ReactNode;
    /** offcanvas (default) gives the mobile Sheet drawer; none = static rail. */
    collapsible?: "offcanvas" | "icon" | "none";
    ariaLabel?: string;
    /** Extra classes on the rail root (e.g. desktop's `only-desktop`). */
    className?: string;
}

export function AppSidebar({
    groups,
    isActive,
    linkComponent,
    brand,
    onNavigate,
    status,
    footer,
    collapsible = "offcanvas",
    ariaLabel = "Navigation",
    className,
}: AppSidebarProps) {
    const Link: ElementType = linkComponent ?? "a";
    return (
        <Sidebar collapsible={collapsible} aria-label={ariaLabel} className={className}>
            <SidebarHeader className="gap-2.5">
                <div
                    data-slot="app-sidebar-brand"
                    className="gap-2.5 px-1 py-0.5 flex min-w-0 items-center group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0"
                >
                    <span className="flex-none">{brand.icon}</span>
                    <span className="leading-tight min-w-0 grid group-data-[collapsible=icon]:hidden">
                        <b className="font-display text-card-title text-ink truncate">
                            {brand.title}
                        </b>
                        {brand.subtitle && (
                            <span className="text-mini text-dim truncate">{brand.subtitle}</span>
                        )}
                    </span>
                </div>
                {status ? (
                    <div data-slot="app-sidebar-status" className="group-data-[collapsible=icon]:hidden">
                        {status}
                    </div>
                ) : null}
            </SidebarHeader>
            <SidebarContent>
                {groups.map((group) => (
                    <SidebarGroup key={group.label}>
                        <SidebarGroupLabel>{group.label}</SidebarGroupLabel>
                        <SidebarGroupContent>
                            <SidebarMenu>
                                {group.items.map((item) => {
                                    const Icon = item.icon;
                                    const content = (
                                        <>
                                            <Icon />
                                            <span>{item.label}</span>
                                        </>
                                    );
                                    return (
                                        <SidebarMenuItem key={item.href}>
                                            <SidebarMenuButton
                                                asChild
                                                isActive={isActive(item.href)}
                                                tooltip={item.label}
                                            >
                                                {onNavigate ? (
                                                    <button
                                                        type="button"
                                                        onClick={() => onNavigate(item.href)}
                                                    >
                                                        {content}
                                                    </button>
                                                ) : (
                                                    <Link href={item.href}>{content}</Link>
                                                )}
                                            </SidebarMenuButton>
                                        </SidebarMenuItem>
                                    );
                                })}
                            </SidebarMenu>
                        </SidebarGroupContent>
                    </SidebarGroup>
                ))}
            </SidebarContent>
            {footer ? (
                <SidebarFooter className="group-data-[collapsible=icon]:hidden">
                    {footer}
                </SidebarFooter>
            ) : null}
            {collapsible === "icon" ? <SidebarRail /> : null}
        </Sidebar>
    );
}
