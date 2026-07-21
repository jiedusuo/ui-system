// @jiedusuo/ui-system — barrel.

export * from "./lib/chart-sync";
export * from "./lib/cn";
export * from "./lib/format";
export * from "./lib/i18n";
export * from "./lib/indicators";
export * from "./lib/strategy-dsl";

export * from "./hooks/useClockEt";
export * from "./hooks/useLocalClock";
export * from "./hooks/useWebSocket";

export * from "./components/Sunflower";
export * from "./components/SpikySun";
export * from "./components/SideNav";
export * from "./components/SectionHead";
export * from "./components/KvGrid";
export * from "./components/PnLChart";
export * from "./components/PositionRow";
export * from "./components/Collapse";
export * from "./components/Welcome";

// CVA primitives (token-driven; re-themed per surface by jiedusuo.css).
export * from "./components/Button";
export * from "./components/Field";
export * from "./components/InlineStatus";
export * from "./components/DataTable";
export * from "./components/Input";
export * from "./components/SecretField";
export * from "./components/Modal";
export * from "./components/Switch";
export * from "./components/SectionCard";
export * from "./components/StatusStrip";
export * from "./components/PagePrimitives";
export * from "./components/AuthorChips";
export * from "./components/SectionNav";
export * from "./components/LoadingState";
export * from "./components/NoticeBox";

// Operator-console primitives (admin v3). Badge/StatusBadge are a deliberate
// pair — metadata tag vs semantic status, which the admin's old local Badge
// conflated. FormSection owns a mutation scope's boundary; ReceiptPanel is how
// every mutation reports back.
export * from "./components/Select";
export * from "./components/Badge";
export * from "./components/EntityRef";
export * from "./components/ReceiptPanel";
export * from "./components/StatStrip";
export * from "./components/FormSection";
export * from "./components/DangerZone";

// Operator shell (admin + sunflower desktop; the public site never mounts it).
// The shadcn registry files under src/ui/ stay INTERNAL — they exist to build
// AppSidebar, and their `Button` / `Input` would shadow the ones every app
// actually imports. Promote one when an app has a real use for it, not before.
export * from "./components/AppSidebar";
// SidebarProvider wraps the rail; SidebarTrigger/SidebarInset are the shell's
// two other seats — the hamburger that opens the ≤900px drawer, and the main
// column that yields to the rail.
export { SidebarInset, SidebarProvider, SidebarTrigger } from "./ui/sidebar";
export { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./ui/tooltip";

// Charts: CandleChart = TradingView lightweight-charts; Histogram = visx;
// Scatter / Sparkline = plain themeable SVG. All re-paint on data-theme /
// dark-mode changes.
export * from "./components/CandleChart";
export * from "./components/OscillatorChart";
export * from "./components/Histogram";
export * from "./components/Scatter";
export * from "./components/Sparkline";
