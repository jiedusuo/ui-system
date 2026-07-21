// Sunflower logo — 12-petal amber with seed-disc + scatter dots.
// The only icon in the whole system. Palette via `--color-sun` /
// `--color-sun-2`; the rotation keyframe lives in base.css.

interface Props {
    size?: number;
    rotating?: boolean;
    className?: string;
    "aria-label"?: string;
}

export function Sunflower({
    size = 46,
    rotating = false,
    className,
    "aria-label": ariaLabel = "Sunflower",
}: Props) {
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
                    animation: rotating ? "sunspin 36s linear infinite" : undefined,
                }}
            >
                <g>
                    {Array.from({ length: 12 }, (_, i) => (
                        <ellipse
                            key={i}
                            cx="24"
                            cy="10"
                            rx="2.8"
                            ry="7.2"
                            fill="var(--color-sun)"
                            stroke="var(--color-sun-2)"
                            strokeWidth="0.55"
                            transform={`rotate(${i * 30} 24 24)`}
                        />
                    ))}
                </g>
                <circle cx="24" cy="24" r="7.4" fill="var(--color-sun-2)" />
                <circle
                    cx="24"
                    cy="24"
                    r="7.4"
                    fill="none"
                    stroke="var(--color-ink)"
                    strokeWidth="0.5"
                    opacity="0.35"
                />
                <g fill="var(--color-ink)" opacity="0.55">
                    <circle cx="24" cy="24" r="0.95" />
                    <circle cx="22" cy="22.6" r="0.7" />
                    <circle cx="26" cy="22.6" r="0.7" />
                    <circle cx="22" cy="25.4" r="0.7" />
                    <circle cx="26" cy="25.4" r="0.7" />
                    <circle cx="24" cy="21" r="0.6" />
                    <circle cx="24" cy="27" r="0.6" />
                    <circle cx="20.6" cy="24" r="0.6" />
                    <circle cx="27.4" cy="24" r="0.6" />
                </g>
            </svg>
        </span>
    );
}
