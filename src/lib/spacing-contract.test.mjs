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
});

test("notices expose stable information, warning, and error semantics", async () => {
    const notice = await source("components/NoticeBox.tsx");
    const skin = await source("styles/jiedusuo.css");
    for (const tone of ["info", "warning", "error"]) {
        assert.match(notice, new RegExp(`${tone}:`));
        assert.match(skin, new RegExp(`\\.ui-notice--${tone}`));
    }
});
