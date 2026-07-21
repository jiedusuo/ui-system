# @jiedusuo/ui-system

Shared React design system and component library for Jiedusuo apps (public site, admin console, desktop client).

## Install

Add a `.npmrc` to your project root:

```
@jiedusuo:registry=https://npm.pkg.github.com
```

Then install:

```bash
npm install @jiedusuo/ui-system
```

## Usage

```tsx
import { Button, Field, Switch, SectionCard, DataTable } from "@jiedusuo/ui-system";
import "@jiedusuo/ui-system/styles/tokens.css";
import "@jiedusuo/ui-system/styles/base.css";
```

### Design tokens

Import `tokens.css` for CSS custom properties (colors, spacing, typography). Layer a surface theme on top:

- `jiedusuo.css` — public site (newsprint/emerald editorial)
- `operator.css` — admin console + desktop client (clean, functional)

### Components

| Category | Components |
|----------|-----------|
| Forms | `Button`, `Field`, `Input`, `SecretField`, `Switch`, `Select` |
| Layout | `SectionCard`, `FormSection`, `PagePrimitives`, `Collapse`, `Modal` |
| Data | `DataTable`, `KvGrid`, `StatStrip`, `StatusStrip`, `InlineStatus` |
| Charts | `CandleChart`, `Sparkline`, `Histogram`, `Scatter`, `OscillatorChart` |
| Navigation | `AppSidebar`, `SideNav`, `SectionNav` |
| Feedback | `NoticeBox`, `Badge`, `ReceiptPanel`, `DangerZone`, `LoadingState` |

### Hooks

- `useWebSocket` — reconnecting WebSocket with backoff
- `useClockEt` — US Eastern market clock
- `useLocalClock` — local time ticker

### Utilities

- `cn()` — `clsx` + `tailwind-merge`
- `format` — currency, percentage, duration formatters
- `strategy-dsl` — strategy rule parser
