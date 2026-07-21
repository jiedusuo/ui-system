"use client";

// Animated expand/collapse container. Used by accordions (the admin
// auto-trade position cards, attach rows) so opening/closing a panel
// glides instead of snapping.
//
// The height animation is the pure-CSS `grid-template-rows: 0fr -> 1fr`
// technique (see base.css `.ui-collapse`) — no JS measuring, animates
// arbitrary auto-height content, and honours `prefers-reduced-motion`.
//
// Children are lazy-mounted on first open and kept mounted afterward, so
// a never-opened row pays nothing, but a close still animates (the
// content is still in the DOM to glide shut).

import { useEffect, useState, type ReactNode } from "react";

interface Props {
    open: boolean;
    children: ReactNode;
    /** Extra classes on the outer grid wrapper. */
    className?: string;
}

export function Collapse({ open, children, className }: Props) {
    const [mounted, setMounted] = useState(open);
    // Once opened, keep the subtree mounted so the close transition has
    // something to collapse.
    useEffect(() => {
        if (open) setMounted(true);
    }, [open]);

    return (
        <div
            className={["ui-collapse", className ?? ""].join(" ").trim()}
            data-open={open ? "true" : "false"}
            // `inert` (React 19) takes the clipped-but-mounted subtree out of
            // BOTH the focus order and the accessibility tree while closed, so
            // keyboard Tab skips the hidden chart controls / attachment form
            // and a focused element can never be stranded under aria-hidden.
            inert={open ? undefined : true}
        >
            <div className="ui-collapse-inner">{mounted ? children : null}</div>
        </div>
    );
}
