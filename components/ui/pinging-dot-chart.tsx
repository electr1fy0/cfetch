"use client";

import { cn } from "@/lib/utils";
import { CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts";

import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

type PingingDatum = {
  label: string;
  value: number;
};

const chartConfig = {
  desktop: {
    label: "Desktop",
    color: "var(--chart-2)",
  },
} satisfies ChartConfig;

export function PingingDotChart({
  data,
  className,
}: {
  data: PingingDatum[];
  className?: string;
}) {
  return (
    <div className={cn("h-full w-full", className)}>
      <div className="h-full w-full p-2 sm:p-4">
        <ChartContainer config={chartConfig} className="h-full w-full">
          <LineChart
            accessibilityLayer
            data={data}
            margin={{
              left: 8,
              right: 8,
              top: 8,
              bottom: 8,
            }}
          >
            <CartesianGrid vertical={false} />
            <YAxis
              domain={["dataMin - 50", "dataMax + 50"]}
              tickLine={false}
              axisLine={false}
              tickMargin={4}
              width={30}
            />
            <XAxis
              dataKey="label"
              tickLine={false}
              axisLine={false}
              tickMargin={4}
            />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            <Line
              dataKey="value"
              type="linear"
              stroke="var(--color-desktop)"
              strokeDasharray="4 4"
              dot={<CustomizedDot />}
            />
          </LineChart>
        </ChartContainer>
      </div>
    </div>
  );
}

const CustomizedDot = (props: React.SVGProps<SVGCircleElement>) => {
  const { cx, cy, stroke } = props;

  return (
    <g>
      <circle cx={cx} cy={cy} r={3} fill={stroke} />
      <circle
        cx={cx}
        cy={cy}
        r={3}
        stroke={stroke}
        fill="none"
        strokeWidth="1"
        opacity="0.8"
      >
        <animate
          attributeName="r"
          values="3;10"
          dur="1s"
          repeatCount="indefinite"
        />
        <animate
          attributeName="opacity"
          values="0.8;0"
          dur="1s"
          repeatCount="indefinite"
        />
      </circle>
    </g>
  );
};
