"use client";

import { cn } from "@/lib/utils";
import { CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts";

import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

type MultiLineDatum = {
  label: string;
  primary: number;
  secondary?: number;
};

export function DottedMultiLineChart({
  data,
  primaryLabel = "Primary",
  secondaryLabel = "Secondary",
  showSecondary = true,
  className,
}: {
  data: MultiLineDatum[];
  primaryLabel?: string;
  secondaryLabel?: string;
  showSecondary?: boolean;
  className?: string;
}) {
  const dynamicConfig = {
    primary: {
      label: primaryLabel,
      color: "var(--chart-2)",
    },
    secondary: {
      label: secondaryLabel,
      color: "var(--chart-5)",
    },
  } satisfies ChartConfig;

  return (
    <div className={cn("h-full w-full", className)}>
      <div className="h-full p-4">
        <ChartContainer config={dynamicConfig} className="h-full w-full !aspect-auto">
          <LineChart
            accessibilityLayer
            data={data}
            margin={{
              left: 12,
              right: 12,
            }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="label"
              tickLine={false}
              axisLine={{ stroke: "#3f3f46" }}
              tick={{ fill: "#a1a1aa", fontSize: 11 }}
              tickMargin={8}
              tickFormatter={(value) => value.slice(0, 3)}
            />
            <YAxis
              tickLine={false}
              axisLine={{ stroke: "#3f3f46" }}
              tick={{ fill: "#a1a1aa", fontSize: 11 }}
              tickMargin={8}
              width={44}
            />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            <Line
              dataKey="primary"
              type="linear"
              stroke="var(--color-primary)"
              dot={false}
              strokeDasharray="4 4"
            />
            {showSecondary ? (
              <Line
                dataKey="secondary"
                type="linear"
                stroke="var(--color-secondary)"
                dot={false}
                strokeDasharray="6 6"
              />
            ) : null}
          </LineChart>
        </ChartContainer>
      </div>
    </div>
  );
}
