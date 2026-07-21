import { DSL_CATALOG } from "./dsl-catalog.generated";

export * from "./actor-roster";

export type DslScope = "graph" | "sizing" | "both";

export interface DslToken {
    name: string;
    type: "num" | "bool" | "enum" | "func" | "duration" | "mode";
    scope: DslScope;
    detail: string;
}

// The token catalog is a frozen editor snapshot. The rewrite retired the
// server-side metadata endpoint; factor tokens mirror wire's v2 catalog and
// the ui-system test pins the breaking no-v1-alias boundary.
const toToken = (t: {
    name: string;
    type: string;
    scope: string;
    detail: string;
}): DslToken => ({
    name: t.name,
    type: t.type as DslToken["type"],
    scope: t.scope as DslScope,
    detail: t.detail,
});

export const DSL_BUILTINS: DslToken[] = DSL_CATALOG.builtins.map(toToken);

export const DSL_FUNCTIONS: DslToken[] = DSL_CATALOG.functions.map(toToken);

// Author.<key> values are roster-owned and added dynamically by the desktop.
export const DSL_ENUM_VALUES: DslToken[] = DSL_CATALOG.enums
    .map(toToken)
    .filter((token) => !token.name.toLowerCase().startsWith("author."));

export const DSL_EXEC_MODES: DslToken[] = DSL_CATALOG.execution_modes.map(toToken);

export const DSL_AUTHOR_EVENTS: DslToken[] = DSL_CATALOG.author_events.map(toToken);

export const DSL_COMPLETION_TOKENS = [
    ...DSL_BUILTINS,
    ...DSL_FUNCTIONS,
    ...DSL_ENUM_VALUES,
    ...DSL_EXEC_MODES,
    ...DSL_AUTHOR_EVENTS,
];

export const SAMPLE_GRAPH = {
    version: 1,
    nodes: [
        {
            id: "tp1",
            when: { price: "option.mark", at_or_above: "position.avg_fill * 1.5" },
            do: [
                { sell: { qty: "ceil(position.original_qty / 2)", exec: "resting" } },
                { arm: "runner" },
            ],
        },
        {
            id: "runner",
            armed: false,
            when: {
                expr: "underlying.close < ema(underlying.close, 9, 60s)",
                eval: "candle_close",
                debounce_bars: 1,
            },
            do: [{ sell: { qty: "position.remaining_qty", exec: "chase" } }],
        },
        {
            id: "hard_floor",
            when: { price: "option.mark", at_or_below: "position.avg_fill * 0.35" },
            do: [{ sell: { qty: "position.remaining_qty", exec: "market_fallback" } }],
        },
        {
            id: "author_follow",
            repeat: true,
            when: { author_event: ["trim", "close"] },
            do: [
                { sell: { qty: "ceil(author.fraction * position.remaining_qty)", exec: "chase" } },
            ],
        },
    ],
};

export const SAMPLE_SIZING = {
    version: 1,
    port_fraction:
        "option.ask >= 0.50 ? config.port_frac * (is_zero_dte ? 0.625 : 1.25) : 0.0",
};

export const SAMPLE_PRESET = {
    schema_version: 1,
    id: "dsl-runner-example",
    name: "DSL runner example",
    description:
        "Half out at +50%, run the rest on underlying EMA, keep a hard floor, and follow author exits.",
    author: { display: "Jiedusuo", verified: true },
    strategy: {
        graph: SAMPLE_GRAPH,
        sizing: SAMPLE_SIZING,
        routing: { authors: ["Author.enrich"] },
    },
};
