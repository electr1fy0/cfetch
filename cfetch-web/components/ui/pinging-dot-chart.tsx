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
import { Badge } from "@/components/ui/badge";
import { HugeiconsIcon } from "@hugeicons/react";
import { TrendingUp } from "@hugeicons/core-free-icons";

type PingingDotChartPoint = {
  label: string;
  rating: number;
};

const chartConfig = {
  rating: {
    label: "Rating",
    color: "var(--chart-2)",
  },
} satisfies ChartConfig;

export function PingingDotChart({
  data,
  title = "Codeforces rating trend",
  description,
}: {
  data: PingingDotChartPoint[];
  title?: string;
  description?: string;
}) {
  const first = data[0]?.rating ?? 0;
  const last = data[data.length - 1]?.rating ?? 0;
  const delta = last - first;
  const deltaText = `${delta >= 0 ? "+" : ""}${delta}`;

  if (data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          <CardDescription>No rating updates available.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {title}
          <Badge
            variant={delta >= 0 ? "success-light" : "destructive-light"}
            className="ml-2 border-none"
          >
            <HugeiconsIcon icon={TrendingUp} size={16} strokeWidth={2} />
            <span>{deltaText}</span>
          </Badge>
        </CardTitle>
        <CardDescription>{description ?? "Recent contests"}</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
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
              tickFormatter={(value: string) => value}
            />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            <Line
              dataKey="rating"
              type="linear"
              stroke="var(--color-rating)"
              strokeDasharray="4 4"
              dot={<CustomizedDot />}
            />
          </LineChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}

const CustomizedDot = (props: React.SVGProps<SVGCircleElement>) => {
  const { cx, cy, stroke } = props;

  return (
    <g>
      {/* Main dot */}
      <circle cx={cx} cy={cy} r={3} fill={stroke} />
      {/* Ping animation circles */}
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
