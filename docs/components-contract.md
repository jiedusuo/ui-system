# Component contract

This package is the source of truth for shared Jiedusuo primitives. Consumers
pin an immutable Git revision; they do not carry edited source copies.

## Feedback semantics

`NoticeBox`, `InlineStatus`, `StatusBox`, and `StatusDot` accept exactly the
same tones: `neutral`, `info`, `success`, `warning`, and `error`. Accent is not
a status. A `StatusDot` pulses only when `pulse` is true; animation does not
change its semantic tone.

## Forms

`Input`, `Textarea`, and `Select` render prose in the sans face by default.
Machine literals, source text, identifiers, numeric wire values, and code opt
into Geist Mono with `code`. `Field` owns the canonical invalid state and
associates its label, help, and error with the real control through `id`,
`htmlFor`, and `aria-describedby`.

`SecretField` may stand alone with its own label, help, and error, or sit
inside `Field`. Neither composition nests labels. It remains a text input
masked with `-webkit-text-security`, preserving IME entry for Chinese site
passwords.

## Composition

`FormSection` is one mutation boundary. Header metadata, scope actions, and
the footer/receipt use its named slots instead of page-local wrappers.
`EmptyStatePanel density="compact"` fits an existing card or dense operator
pane; the default density remains a standalone empty page section.

`SegmentedControl` switches sibling tasks in place and uses tab semantics.
`SectionNav` remains navigation between document or page sections.
`GroupedList` and `GroupedListGroup` own the repeated expandable-group chrome.

`KvGrid.maxCols` is an upper bound: the responsive contract caps it at two
columns at 900px and one at 600px.

## Operator shell

`AppSidebar` receives a structured brand (`icon`, `title`, optional
`subtitle`) and owns the icon-collapse layout. Callers must not hide their
wordmark with local overflow selectors. Route-based apps provide links;
state-driven desktop shells use `onNavigate`.

Operator consumers import CSS in this order:

```css
@import "@jiedusuo/ui-system/styles/tokens.css";
@import "@jiedusuo/ui-system/styles/base.css";
@import "@jiedusuo/ui-system/styles/jiedusuo.css";
@import "@jiedusuo/ui-system/styles/operator.css";
```

## Chart geometry

`Sparkline.refLine` is series-neutral and paints above the area. `Scatter`
reserves separate rows when x ticks and an x-axis label coexist.
`OscillatorChart` moves series labels into a bounded overlay below 120px so
they cannot collide with the price axis.
