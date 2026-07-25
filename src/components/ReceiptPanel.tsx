import { cn } from "../lib/cn";
import { Badge } from "./Badge";

/** What a mutation endpoint answered with. Structural on purpose: the package
 * must not depend on the console's generated contract types. */
export interface Receipt {
    /** HTTP status; `0` means the request never reached the server. */
    status: number;
    body: unknown;
    /** The `Idempotency-Key` the mutation was sent with. */
    key?: string;
}

export interface ReceiptPanelProps {
    receipt: Receipt | null;
    className?: string;
}

/**
 * The receipt of one mutation, rendered in full: `HTTP <status>`, the typed
 * `code` the server rejected with (as a code badge), the whole JSON body, and
 * the `Idempotency-Key` the request carried.
 *
 * Mount it under every mutation form — an operator must be able to read the
 * exact rejection reason, not a generic "失败". 2xx gets an ok left-bar; 4xx /
 * 409 get a negative left-bar with the typed code made prominent; status `0`
 * is a transport failure (the request never landed). A null receipt renders
 * nothing, so it can sit in the tree before the first submit.
 *
 * The body is a machine literal: `font-code`, wrapped and scrollable, never
 * truncated.
 */
export function ReceiptPanel({ receipt, className }: ReceiptPanelProps) {
    if (!receipt) return null;
    const ok = receipt.status >= 200 && receipt.status < 300;
    const code =
        receipt.body && typeof receipt.body === "object" && "code" in receipt.body
            ? String((receipt.body as { code: unknown }).code)
            : null;
    return (
        <div
            role="status"
            className={cn(
                "mt-stack-md border-rule-soft bg-paper overflow-hidden rounded-[var(--radius-surface)] border border-l-[3px] shadow-[var(--elevation-card)]",
                ok ? "border-l-ok" : "border-l-negative",
                className,
            )}
        >
            <div className="gap-control-x border-rule-soft bg-paper-2 px-panel py-control-y flex flex-wrap items-center border-b">
                <span
                    className={cn(
                        "font-code text-value font-semibold",
                        ok ? "text-ok-2" : "text-negative-2",
                    )}
                >
                    {receipt.status ? `HTTP ${receipt.status}` : "传输失败"}
                </span>
                {code && (
                    <Badge tone={ok ? "ok" : "err"} code>
                        {code}
                    </Badge>
                )}
                <span className="font-sans text-mini text-dim ml-auto">
                    Idempotency-Key{" "}
                    <span className="font-code text-muted">{receipt.key ?? "已随请求提交"}</span>
                </span>
            </div>
            <pre className="m-0 max-h-80 px-panel py-action-y font-code text-label leading-relaxed text-ink overflow-auto break-words whitespace-pre-wrap">
                {JSON.stringify(receipt.body, null, 2)}
            </pre>
        </div>
    );
}
