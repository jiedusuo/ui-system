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

export interface AppSidebarProps {
    groups: NavGroup[];
    /** True when `href` is the active route. The app owns pathname matching
     *  (admin strips its basePath; desktop does not). */
    isActive: (href: string) => boolean;
    /** App-supplied client Link (e.g. next/link). Defaults to a plain <a>. */
    linkComponent?: ElementType;
    /** Brand block (sun + wordmark), rendered at the top of the rail. */
    brand: ReactNode;
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
                {brand}
                {status}
            </SidebarHeader>
            <SidebarContent>
                {groups.map((group) => (
                    <SidebarGroup key={group.label}>
                        <SidebarGroupLabel>{group.label}</SidebarGroupLabel>
                        <SidebarGroupContent>
                            <SidebarMenu>
                                {group.items.map((item) => {
                                    const Icon = item.icon;
                                    return (
                                        <SidebarMenuItem key={item.href}>
                                            <SidebarMenuButton
                                                asChild
                                                isActive={isActive(item.href)}
                                            >
                                                <Link href={item.href}>
                                                    <Icon />
                                                    <span>{item.label}</span>
                                                </Link>
                                            </SidebarMenuButton>
                                        </SidebarMenuItem>
                                    );
                                })}
                            </SidebarMenu>
                        </SidebarGroupContent>
                    </SidebarGroup>
                ))}
            </SidebarContent>
            {footer ? <SidebarFooter>{footer}</SidebarFooter> : null}
        </Sidebar>
    );
}
