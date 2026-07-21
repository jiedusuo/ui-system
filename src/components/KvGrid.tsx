import type { ReactNode } from "react";

interface KvCellProps {
    label: ReactNode;
    /** Main mono numeric value. */
    value: ReactNode;
    /** Optional unit appended to the value (smaller, --muted). */
    unit?: ReactNode;
    /** Optional aux line below (mono, --muted). */
    aux?: ReactNode;
}

export function KvCell({ label, value, unit, aux }: KvCellProps) {
    return (
        <div className="kv">
            <div className="kv-label">{label}</div>
            <div className="kv-value">
                {value}
                {unit !== undefined && <span className="unit">{unit}</span>}
            </div>
            {aux !== undefined && <div className="kv-aux">{aux}</div>}
        </div>
    );
}

interface KvGridProps {
    children: ReactNode;
    /** Number of equal-width columns. Default 6 to match the design. */
    cols?: number;
}

export function KvGrid({ children, cols = 6 }: KvGridProps) {
    return (
        <div
            className="kv-grid"
            style={cols !== 6 ? { gridTemplateColumns: `repeat(${cols}, 1fr)` } : undefined}
        >
            {children}
        </div>
    );
}
