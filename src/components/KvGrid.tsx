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
    /**
     * Upper bound for equal-width columns. The responsive contract still caps
     * the grid at two columns at ≤900px and one at ≤600px.
     */
    maxCols?: number;
}

export function KvGrid({ children, maxCols = 6 }: KvGridProps) {
    return (
        <div
            className="kv-grid"
            style={
                maxCols !== 6
                    ? { gridTemplateColumns: `repeat(${maxCols}, minmax(0, 1fr))` }
                    : undefined
            }
        >
            {children}
        </div>
    );
}
