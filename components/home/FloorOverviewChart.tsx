"use client";

import { Bar, BarChart, CartesianGrid, XAxis } from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import type { Task } from "@/lib/api";

const chartConfig = {
  count: { label: "Tasks" },
  queued: { label: "Queued", color: "#f59e0b" },
  active: { label: "In progress", color: "#0f766e" },
  done: { label: "Done", color: "#059669" },
} satisfies ChartConfig;

export function FloorOverviewChart({ tasks }: { tasks: Task[] }) {
  const queued = tasks.filter((t) => t.status === "queued").length;
  const active = tasks.filter((t) => t.status === "in_progress").length;
  const done = tasks.filter((t) => t.status === "done").length;

  const data = [
    { label: "Queued", count: queued, fill: "var(--color-queued)" },
    { label: "Active", count: active, fill: "var(--color-active)" },
    { label: "Done", count: done, fill: "var(--color-done)" },
  ];

  return (
    <ChartContainer config={chartConfig} className="min-h-[180px] w-full">
      <BarChart accessibilityLayer data={data} margin={{ top: 12, right: 4, left: 4, bottom: 4 }}>
        <CartesianGrid vertical={false} strokeDasharray="4 4" />
        <XAxis
          dataKey="label"
          tickLine={false}
          axisLine={false}
          tickMargin={10}
          fontSize={12}
        />
        <ChartTooltip content={<ChartTooltipContent hideLabel />} />
        <Bar dataKey="count" radius={[10, 10, 0, 0]} maxBarSize={48} />
      </BarChart>
    </ChartContainer>
  );
}
