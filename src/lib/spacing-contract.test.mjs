import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const root = new URL("../", import.meta.url);

async function source(path) {
    return readFile(new URL(path, root), "utf8");
}

test("the shared spacing roles remain available to consumers", async () => {
    const tokens = await source("styles/tokens.css");
    for (const name of [
        "field-gap",
        "control-x",
        "control-y",
        "control-compact-x",
        "control-compact-y",
        "action-x",
        "action-y",
        "panel",
        "panel-y",
        "surface-x",
        "surface-y",
        "surface-bottom",
        "stack-xs",
        "stack-md",
        "stack-lg",
        "section",
    ]) {
        assert.match(tokens, new RegExp(`--spacing-${name}:`), `missing spacing role ${name}`);
    }
});

test("all text-entry controls share the same density contract", async () => {
    const field = await source("components/Field.tsx");
    const secret = await source("components/SecretField.tsx");
    assert.match(field, /controlDensity\[density\]/);
    assert.match(field, /TextareaProps[\s\S]*density\?: keyof typeof controlDensity/);
    assert.match(secret, /controlClass/);
    assert.match(secret, /controlDensity\[density\]/);
    assert.doesNotMatch(secret, /px-2\.5 py-2/);
});

test("reusable surfaces consume semantic insets instead of private padding", async () => {
    const contracts = {
        "components/SectionCard.tsx": /px-surface-x/,
        "components/FormSection.tsx": /p-panel/,
        "components/Modal.tsx": /px-surface-x/,
        "components/NoticeBox.tsx": /px-panel/,
        "components/InlineStatus.tsx": /px-panel/,
        "components/StatusStrip.tsx": /px-surface-x/,
        "components/StatStrip.tsx": /px-panel/,
        "components/ReceiptPanel.tsx": /px-panel/,
        "components/DangerZone.tsx": /p-panel/,
        "components/DataTable.tsx": /first:pl-panel/,
        "components/LoadingState.tsx": /px-surface-x/,
    };
    for (const [path, pattern] of Object.entries(contracts)) {
        assert.match(await source(path), pattern, `${path} drifted from the spacing contract`);
    }
    const sectionCard = await source("components/SectionCard.tsx");
    assert.match(sectionCard, /ui-sectioncard-body/);
    assert.match(sectionCard, /data-flush=/);
});

test("feedback primitives expose one semantic tone vocabulary without aliases", async () => {
    const notice = await source("components/NoticeBox.tsx");
    const inline = await source("components/InlineStatus.tsx");
    const strip = await source("components/StatusStrip.tsx");
    const tones = await source("lib/semantic-tone.ts");
    const skin = await source("styles/jiedusuo.css");
    assert.match(notice, /Info/);
    assert.match(notice, /TriangleAlert/);
    assert.match(notice, /CircleX/);
    assert.doesNotMatch(notice, /resolvedTone === "info"[\s\S]*"i"/);
    for (const tone of ["neutral", "info", "success", "warning", "error"]) {
        assert.match(tones, new RegExp(`"${tone}"`));
        assert.match(notice, new RegExp(`${tone}:`));
        assert.match(skin, new RegExp(`\\.ui-notice--${tone}`));
    }
    for (const alias of ["danger", "primary", "ok", "warn", "err", "idle", "off", "live"]) {
        assert.doesNotMatch(
            `${notice}\n${inline}\n${strip}`,
            new RegExp(`\\b${alias}:`),
            `legacy tone alias ${alias} returned`,
        );
    }
});
