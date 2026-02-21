"use client";

import { CartesianGrid, Line, LineChart, XAxis } from "recharts";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
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
  title = "Multi Line Chart",
  description = "",
  data,
  primaryLabel = "Primary",
  secondaryLabel = "Secondary",
  showSecondary = true,
}: {
  title?: string;
  description?: string;
  data: MultiLineDatum[];
  primaryLabel?: string;
  secondaryLabel?: string;
  showSecondary?: boolean;
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
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
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
