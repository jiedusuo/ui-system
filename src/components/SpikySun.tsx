// Admin masthead logo — amber sun disc with 16 black rays at
// irregular lengths, rotates iff the engine is running. Sister to
// Sunflower (public/desktop) but visually sharper to match the
// admin emerald accent without sharing the seed-petal vocabulary.

interface Props {
    size?: number;
    rotating?: boolean;
    className?: string;
    "aria-label"?: string;
}

// Pre-baked irregular ray lengths (4-9 viewBox units). 16 rays at
// 22.5° spacing — even angles, deliberately varied magnitudes so the
// silhouette never reads as a polygon.
const RAY_LENGTHS = [8, 5, 7, 4, 9, 5, 6, 8, 5, 9, 4, 7, 6, 5, 8, 4];

export function SpikySun({
    size = 46,
    rotating = false,
    className,
    "aria-label": ariaLabel = "Sun",
}: Props) {
    const cx = 24;
    const cy = 24;
    const disc = 7.5;

    return (
        <span
            data-rotating={rotating ? "true" : "false"}
            className={className}
            style={{ display: "inline-flex", lineHeight: 0 }}
        >
            <svg
                viewBox="0 0 48 48"
                width={size}
                height={size}
                role="img"
                aria-label={ariaLabel}
                style={{
                    display: "block",
                    transformOrigin: "center",
                    animation: rotating ? "sunspin 48s linear infinite" : undefined,
                }}
            >
                <g stroke="var(--color-ink)" strokeWidth="1.4" strokeLinecap="round">
                    {RAY_LENGTHS.map((len, i) => {
                        const angle = (i * (360 / RAY_LENGTHS.length) - 90) * (Math.PI / 180);
                        const x1 = cx + (disc + 1) * Math.cos(angle);
                        const y1 = cy + (disc + 1) * Math.sin(angle);
                        const x2 = cx + (disc + 1 + len) * Math.cos(angle);
                        const y2 = cy + (disc + 1 + len) * Math.sin(angle);
                        return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} />;
                    })}
                </g>
                <circle cx={cx} cy={cy} r={disc} fill="var(--color-sun)" />
                <circle
                    cx={cx}
                    cy={cy}
                    r={disc}
                    fill="none"
                    stroke="var(--color-sun-2)"
                    strokeWidth="0.8"
                />
            </svg>
        </span>
    );
}
