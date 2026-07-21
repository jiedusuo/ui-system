import assert from "node:assert/strict";
import test from "node:test";

import { resolveAuthorSymbols, resolveStrategyPresetAuthors } from "./actor-roster.ts";
import { DSL_CATALOG } from "./dsl-catalog.generated.ts";

const roster = {
    schema_version: 2,
    catalog_rev: 7,
    actors: [
        { actor_id: "act_enrich", key: "enrich", label: "干爹" },
        { actor_id: "act_j", key: "j", label: "二舅" },
        { actor_id: "act_unkeyed", key: null, label: "No DSL symbol" },
    ],
};

test("known Author keys resolve case-insensitively to canonical actor ids", () => {
    const resolved = resolveStrategyPresetAuthors(
        { strategy: { routing: { authors: ["AUTHOR.ENRICH", "Author.j"] } } },
        roster,
    );
    assert.deepEqual(resolved.strategy.routing, { actor_ids: ["act_enrich", "act_j"] });
});

test("unknown Author keys list the roster-backed choices", () => {
    assert.throws(
        () => resolveAuthorSymbols(["Author.missing"], roster),
        /available authors: Author\.enrich, Author\.j/,
    );
});

test("an unavailable roster fails instead of producing empty actor_ids", () => {
    assert.throws(
        () => resolveAuthorSymbols(["Author.enrich"]),
        /Author roster unavailable/,
    );
});

test("factor completions expose exactly the breaking v2 catalog", () => {
    const factors = DSL_CATALOG.builtins
        .filter(({ name }) => name.startsWith("factor."))
        .map(({ name, type, scope }) => ({ name, type, scope }));

    assert.deepEqual(factors, [
        { name: "factor.underlying.broke_pdh", type: "bool", scope: "both" },
        { name: "factor.underlying.trend_persist_days", type: "num", scope: "both" },
        { name: "factor.market.spy_range_yesterday", type: "bool", scope: "both" },
        { name: "factor.market.spy_misaligned", type: "bool", scope: "both" },
        { name: "factor.option.runup_60m", type: "num", scope: "both" },
        { name: "factor.option.macd_rel_5m", type: "num", scope: "both" },
        { name: "factor.underlying.momentum_15m", type: "num", scope: "both" },
        { name: "factor.option.moneyness", type: "num", scope: "both" },
    ]);
});
