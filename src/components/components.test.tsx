// @vitest-environment jsdom

import "@testing-library/jest-dom/vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { Gauge } from "lucide-react";
import { describe, expect, it, vi } from "vitest";

import { AppSidebar } from "./AppSidebar";
import { Field, Input } from "./Field";
import { FormSection } from "./FormSection";
import { GroupedList, GroupedListGroup } from "./GroupedList";
import { KvGrid } from "./KvGrid";
import { NoticeBox } from "./NoticeBox";
import { OscillatorChart } from "./OscillatorChart";
import { Scatter } from "./Scatter";
import { SecretField } from "./SecretField";
import { SegmentedControl } from "./SegmentedControl";
import { Sparkline } from "./Sparkline";
import { SidebarProvider } from "../ui/sidebar";

Object.defineProperty(window, "matchMedia", {
    writable: true,
    value: vi.fn().mockImplementation((query: string) => ({
        matches: false,
        media: query,
        onchange: null,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        addListener: vi.fn(),
        removeListener: vi.fn(),
        dispatchEvent: vi.fn(),
    })),
});

describe("form semantics", () => {
    it("associates Field labels and errors with a SecretField without nested labels", () => {
        const { container } = render(
            <Field label="确认口令" error="两次输入不一致" help="再次输入同一口令">
                <SecretField value="" onChange={() => undefined} />
            </Field>,
        );

        const input = screen.getByLabelText("确认口令");
        expect(input).toHaveAttribute("aria-invalid", "true");
        expect(input.getAttribute("aria-describedby")?.split(" ")).toHaveLength(2);
        expect(container.querySelector("label label")).toBeNull();
    });

    it("uses prose by default and code only by explicit opt-in", () => {
        const { rerender } = render(<Input aria-label="name" />);
        expect(screen.getByLabelText("name")).toHaveClass("font-sans");
        rerender(<Input aria-label="id" code />);
        expect(screen.getByLabelText("id")).toHaveClass("font-code");
    });
});

describe("composition primitives", () => {
    it("keeps FormSection actions and footer inside the fieldset", () => {
        const { container } = render(
            <FormSection
                title="作者资料"
                sub="write_actor"
                headerMeta="3 条消息流"
                actions={<button type="button">保存</button>}
                footer={<div>完整回执</div>}
            >
                <Input aria-label="作者名" />
            </FormSection>,
        );
        const fieldset = container.querySelector("fieldset");
        expect(fieldset).toContainElement(screen.getByRole("button", { name: "保存" }));
        expect(fieldset).toContainElement(screen.getByText("完整回执"));
    });

    it("maps segmented values and exposes tab state", () => {
        const onChange = vi.fn();
        render(
            <SegmentedControl
                ariaLabel="运维任务"
                value="collectors"
                onChange={onChange}
                options={[
                    { value: "collectors", label: "采集器" },
                    { value: "orders", label: "订单游标" },
                ]}
            />,
        );
        expect(screen.getByRole("tab", { name: "采集器" })).toHaveAttribute(
            "aria-selected",
            "true",
        );
        fireEvent.click(screen.getByRole("tab", { name: "订单游标" }));
        expect(onChange).toHaveBeenCalledWith("orders");
    });

    it("owns expandable grouped-list state", () => {
        render(
            <GroupedList>
                <GroupedListGroup title="Discord" meta="3 个流">
                    <div>期权警报</div>
                </GroupedListGroup>
            </GroupedList>,
        );
        const trigger = screen.getByRole("button", { name: /Discord/ });
        expect(trigger).toHaveAttribute("aria-expanded", "true");
        fireEvent.click(trigger);
        expect(trigger).toHaveAttribute("aria-expanded", "false");
    });

    it("treats KvGrid maxCols as a desktop upper bound", () => {
        const { container } = render(<KvGrid maxCols={4}>cells</KvGrid>);
        expect(container.firstElementChild).toHaveStyle({
            gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
        });
    });
});

describe("operator shell", () => {
    it("owns brand collapse markup and supports state-driven navigation", () => {
        const onNavigate = vi.fn();
        const { container } = render(
            <SidebarProvider defaultOpen={false}>
                <AppSidebar
                    collapsible="icon"
                    brand={{ icon: <span>赚</span>, title: "赚钱所", subtitle: "交易引擎" }}
                    groups={[
                        {
                            label: "交易",
                            items: [{ href: "dashboard", label: "总览", icon: Gauge }],
                        },
                    ]}
                    isActive={(href) => href === "dashboard"}
                    onNavigate={onNavigate}
                />
            </SidebarProvider>,
        );
        const brand = container.querySelector('[data-slot="app-sidebar-brand"]');
        expect(brand).not.toBeNull();
        expect(screen.getByText("赚钱所").parentElement).toHaveClass(
            "group-data-[collapsible=icon]:hidden",
        );
        fireEvent.click(screen.getByRole("button", { name: "总览" }));
        expect(onNavigate).toHaveBeenCalledWith("dashboard");
    });
});

describe("feedback and chart regressions", () => {
    it("renders only the shared semantic NoticeBox tones", () => {
        const { container } = render(
            <NoticeBox tone="success" title="已保存">
                完整回执已写入
            </NoticeBox>,
        );
        expect(container.firstElementChild).toHaveClass("ui-notice--success");
    });

    it("paints the Sparkline reference above its area", () => {
        const { container } = render(
            <Sparkline values={[0.2, 0.8]} refLine={0.5} fill ariaLabel="胜率" />,
        );
        const marks = [...container.querySelector("svg")!.children].map((node) =>
            node.tagName.toLowerCase(),
        );
        expect(marks).toEqual(["path", "line", "path"]);
    });

    it("reserves distinct rows for Scatter ticks and the x label", () => {
        render(
            <Scatter
                points={[{ x: 0, y: 0 }]}
                xTicks={[{ at: 0, label: "0DTE" }]}
                xLabel="到期日"
            />,
        );
        const tickY = Number(screen.getByText("0DTE").getAttribute("y"));
        const labelY = Number(screen.getByText("到期日").getAttribute("y"));
        expect(labelY - tickY).toBeGreaterThanOrEqual(16);
    });

    it("renders bounded labels outside a small oscillator canvas", () => {
        const markup = renderToStaticMarkup(
            <OscillatorChart
                height={92}
                lines={[
                    { label: "DIF", points: [{ ts: 1, value: 1 }] },
                    { label: "DEA", points: [{ ts: 1, value: 2 }] },
                ]}
            />,
        );
        expect(markup).toContain("max-w-[calc(100%-4.5rem)]");
        expect(markup).toContain(">DIF<");
        expect(markup).toContain(">DEA<");
    });
});
