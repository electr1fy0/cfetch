"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PingingDotChart } from "@/components/ui/pinging-dot-chart";
import { IncreaseSizePieChart } from "@/components/ui/increase-size-pie-chart";

export type AnalyticsViewModel = {
  handle: string;
  currentRating: number | null;
  maxRating: number | null;
  rank: string | null;
  maxRank: string | null;
  contests: number;
  accepted: number;
  submissions: number;
  uniqueSolved: number;
  acceptanceRate: number;
  ratingTrend: { label: string; rating: number; delta: number; at: string }[];
  verdictBreakdown: { name: string; value: number }[];
  topTags: { tag: string; solved: number }[];
  activityByHour: { hour: string; submissions: number }[];
  problemRatingMix: { bucket: string; attempts: number }[];
};

const darkTooltipStyle = {
  background: "#0c0a09",
  border: "1px solid #44403c",
  color: "#e7e5e4",
};

const darkTooltipProps = {
  contentStyle: darkTooltipStyle,
  wrapperStyle: { outline: "none" as const },
  itemStyle: { color: "#e7e5e4" },
  labelStyle: { color: "#d6d3d1" },
};

const HatchedBarShape = (
  props: React.SVGProps<SVGRectElement> & {
    dataKey?: string;
    payload?: { delta?: number };
    index?: number;
  }
) => {
  const { fill, x, y, width, height, dataKey, payload, index } = props;
  const safeX = Number(x ?? 0);
  const safeY = Number(y ?? 0);
  const safeWidth = Number(width ?? 0);
  const safeHeight = Number(height ?? 0);

  const rectX = safeWidth < 0 ? safeX + safeWidth : safeX;
  const rectY = safeHeight < 0 ? safeY + safeHeight : safeY;
  const rectWidth = Math.abs(safeWidth);
  const rectHeight = Math.abs(safeHeight);
  const colorFromDelta =
    typeof payload?.delta === "number"
      ? payload.delta >= 0
        ? "#22c55e"
        : "#ef4444"
      : fill;
  const patternId = `hatched-bar-pattern-${dataKey}-${index ?? 0}`;

  return (
    <>
      <rect
        rx={4}
        x={rectX}
        y={rectY}
        width={rectWidth}
        height={rectHeight}
        stroke="none"
        fill={`url(#${patternId})`}
      />
      <defs>
        <pattern
          key={patternId}
          id={patternId}
          x="0"
          y="0"
          width="5"
          height="5"
          patternUnits="userSpaceOnUse"
          patternTransform="rotate(-45)"
        >
          <rect width="10" height="10" opacity={0.5} fill={colorFromDelta}></rect>
          <rect width="1" height="10" fill={colorFromDelta}></rect>
        </pattern>
      </defs>
    </>
  );
};

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <Card className="border-stone-800 bg-stone-900/70">
      <CardContent className="px-4 py-3">
        <p className="text-[11px] uppercase tracking-[0.18em] text-stone-400">{label}</p>
        <p className="mt-1 text-xl font-semibold text-stone-100">{value}</p>
      </CardContent>
    </Card>
  );
}

export function AnalyticsDashboard({ data }: { data: AnalyticsViewModel }) {
  return (
    <div className="min-h-screen bg-stone-950 p-4 text-stone-100 sm:p-6">
      <div className="mx-auto w-full max-w-7xl space-y-4">
        <Card className="border-stone-800 bg-stone-900/60">
          <CardHeader>
            <CardTitle className="text-2xl">CF Analytics: {data.handle}</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            <StatCard label="Current Rating" value={data.currentRating?.toString() ?? "Unrated"} />
            <StatCard label="Max Rating" value={data.maxRating?.toString() ?? "Unrated"} />
            <StatCard label="Rank" value={data.rank ?? "-"} />
            <StatCard label="Contests" value={data.contests.toString()} />
            <StatCard label="Acceptance" value={`${data.acceptanceRate.toFixed(1)}%`} />
            <StatCard label="Submissions" value={data.submissions.toString()} />
            <StatCard label="Accepted" value={data.accepted.toString()} />
            <StatCard label="Unique Solved" value={data.uniqueSolved.toString()} />
            <StatCard label="Max Rank" value={data.maxRank ?? "-"} />
          </CardContent>
        </Card>

        <div className="grid gap-4 lg:grid-cols-2">
          <PingingDotChart
            title="Rating Trend by Contest"
            description="Contest timeline with pinging markers."
            data={data.ratingTrend.map((row) => ({
              label: row.at,
              value: row.rating,
            }))}
          />

          <Card className="border-stone-800 bg-stone-900/60">
            <CardHeader>
              <CardTitle className="text-base">Per-Contest Delta</CardTitle>
            </CardHeader>
            <CardContent className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.ratingTrend.slice(-30)}>
                  <CartesianGrid stroke="#292524" strokeDasharray="3 3" />
                  <XAxis dataKey="label" tick={{ fill: "#a8a29e", fontSize: 10 }} hide />
                  <YAxis tick={{ fill: "#a8a29e", fontSize: 11 }} width={44} />
                  <Tooltip
                    {...darkTooltipProps}
                    cursor={{ fill: "rgba(68, 64, 60, 0.28)" }}
                  />
                  <Bar dataKey="delta" shape={<HatchedBarShape />} radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <IncreaseSizePieChart
            title="Verdict Breakdown (Recent)"
            description="Most recent verdict distribution."
            data={data.verdictBreakdown.map((row) => ({
              name: row.name,
              value: row.value,
            }))}
          />

          <Card className="border-stone-800 bg-stone-900/60">
            <CardHeader>
              <CardTitle className="text-base">Most Solved Tags</CardTitle>
            </CardHeader>
            <CardContent className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.topTags} layout="vertical" margin={{ left: 12, right: 16 }}>
                  <CartesianGrid stroke="#292524" strokeDasharray="3 3" />
                  <XAxis type="number" tick={{ fill: "#a8a29e", fontSize: 11 }} />
                  <YAxis type="category" dataKey="tag" tick={{ fill: "#a8a29e", fontSize: 11 }} width={110} />
                  <Tooltip
                    {...darkTooltipProps}
                    cursor={{ fill: "rgba(68, 64, 60, 0.28)" }}
                  />
                  <Bar dataKey="solved" fill="#38bdf8" shape={<HatchedBarShape />} radius={[0, 6, 6, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="border-stone-800 bg-stone-900/60">
            <CardHeader>
              <CardTitle className="text-base">Activity by Hour</CardTitle>
            </CardHeader>
            <CardContent className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.activityByHour}>
                  <CartesianGrid stroke="#292524" strokeDasharray="3 3" />
                  <XAxis dataKey="hour" tick={{ fill: "#a8a29e", fontSize: 10 }} minTickGap={12} />
                  <YAxis tick={{ fill: "#a8a29e", fontSize: 11 }} width={44} />
                  <Tooltip
                    {...darkTooltipProps}
                    cursor={{ fill: "rgba(68, 64, 60, 0.28)" }}
                  />
                  <Bar dataKey="submissions" fill="#a78bfa" shape={<HatchedBarShape />} radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="border-stone-800 bg-stone-900/60">
            <CardHeader>
              <CardTitle className="text-base">Attempted Problem Rating Mix</CardTitle>
            </CardHeader>
            <CardContent className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.problemRatingMix}>
                  <CartesianGrid stroke="#292524" strokeDasharray="3 3" />
                  <XAxis dataKey="bucket" tick={{ fill: "#a8a29e", fontSize: 11 }} />
                  <YAxis tick={{ fill: "#a8a29e", fontSize: 11 }} width={44} />
                  <Tooltip
                    {...darkTooltipProps}
                    cursor={{ fill: "rgba(68, 64, 60, 0.28)" }}
                  />
                  <Bar dataKey="attempts" fill="#f59e0b" shape={<HatchedBarShape />} radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
