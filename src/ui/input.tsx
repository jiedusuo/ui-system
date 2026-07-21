import * as React from "react";

import { cn } from "../lib/cn";

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
    return (
        <input
            type={type}
            data-slot="input"
            className={cn(
                "h-9 min-w-0 rounded-md border-input px-3 py-1 text-base shadow-xs selection:bg-primary selection:text-primary-foreground file:h-7 file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground md:text-sm dark:bg-input/30 w-full border bg-transparent transition-[color,box-shadow] outline-none file:inline-flex file:border-0 file:bg-transparent disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50",
                "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
                "aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40",
                className,
            )}
            {...props}
        />
    );
}

export { Input };
