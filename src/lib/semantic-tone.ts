/**
 * Shared semantic status vocabulary.
 *
 * Product accent is intentionally absent: `primary` describes hierarchy, not
 * health. Animation is also orthogonal; callers opt a status dot into pulsing
 * with its `pulse` prop.
 */
export type SemanticTone = "neutral" | "info" | "success" | "warning" | "error";
