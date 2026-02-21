"use client";

import { LabelList, Pie, PieChart, Cell } from "recharts";

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

type PieDatum = {
  name: string;
  value: number;
  fill?: string;
};

// Configure the size increase between each pie ring
const BASE_RADIUS = 50; // Starting radius for the smallest pie
const SIZE_INCREMENT = 10; // How much to increase radius for each subsequent pie

const chartConfig = {
  visitors: {
    label: "Visitors",
  },
  chrome: {
    label: "Chrome",
    color: "var(--chart-1)",
  },
  safari: {
    label: "Safari",
    color: "var(--chart-2)",
  },
  firefox: {
    label: "Firefox",
    color: "var(--chart-3)",
  },
  edge: {
    label: "Edge",
    color: "var(--chart-4)",
  },
  other: {
    label: "Other",
    color: "var(--chart-5)",
  },
} satisfies ChartConfig;

export function IncreaseSizePieChart({
  data,
  title = "Sized Pie Chart",
  description = "",
}: {
  data: PieDatum[];
  title?: string;
  description?: string;
}) {
  const normalizedData = data.map((entry, idx) => ({
    ...entry,
    fill: entry.fill ?? `var(--chart-${(idx % 5) + 1})`,
  }));
  const sortedChartData = [...normalizedData].sort((a, b) => a.value - b.value);
  const total = sortedChartData.reduce((sum, d) => sum + d.value, 0) || 1;

  return (
    <Card className="flex flex-col">
      <CardHeader className="items-center pb-0">
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        <ChartContainer
          config={chartConfig}
          className="[&_.recharts-text]:fill-background mx-auto aspect-square max-h-[250px]"
        >
          <PieChart>
            <ChartTooltip
              content={<ChartTooltipContent nameKey="value" hideLabel />}
            />
            {sortedChartData.map((entry, index) => (
              <Pie
                key={`pie-${index}`}
                data={[entry]}
                innerRadius={30}
                outerRadius={BASE_RADIUS + index * SIZE_INCREMENT}
                dataKey="value"
                cornerRadius={4}
                startAngle={
                  (sortedChartData
                    .slice(0, index)
                    .reduce((sum, d) => sum + d.value, 0) /
                    total) *
                  360
                }
                endAngle={
                  (sortedChartData
                    .slice(0, index + 1)
                    .reduce((sum, d) => sum + d.value, 0) /
                    total) *
                  360
                }
              >
                <Cell fill={entry.fill} />
                <LabelList
                  dataKey="value"
                  stroke="none"
                  fontSize={12}
                  fontWeight={500}
                  fill="currentColor"
                  formatter={(value: number) => value.toString()}
                />
              </Pie>
            ))}
          </PieChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
