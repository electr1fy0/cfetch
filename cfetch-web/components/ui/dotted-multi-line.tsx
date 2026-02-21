"use client";

import { cn } from "@/lib/utils";
import { CartesianGrid, Line, LineChart, XAxis } from "recharts";

import {
  Card,
  CardContent,
} from "@/components/ui/card";
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
    <Card className={cn("border-zinc-800 bg-[#171717]", className)}>
      <CardContent className="p-6">
        <ChartContainer config={dynamicConfig}>
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
              axisLine={false}
              tickMargin={8}
              tickFormatter={(value) => value.slice(0, 3)}
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
      </CardContent>
    </Card>
  );
}
