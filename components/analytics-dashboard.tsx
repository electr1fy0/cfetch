"use client";

import { useEffect, useRef, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  TrendingUp,
  Award,
  Trophy,
  Info,
} from "lucide-react";
import { PingingDotChart } from "@/components/ui/pinging-dot-chart";
import { IncreaseSizePieChart } from "@/components/ui/increase-size-pie-chart";
import { DottedMultiLineChart } from "@/components/ui/dotted-multi-line";
import { cn } from "@/lib/utils";

export type AnalyticsViewModel = {
  basic: {
    handle: string;
    currentRating: number | null;
    maxRating: number | null;
    rank: string | null;
    contribution: number;
    organization: string | null;
    registrationDate: string;
    ratingDeltaFromMax: number;
    totalContests: number;
    totalSolved: number;
  };
  rating: {
    trend: { label: string; rating: number; delta: number; at: string }[];
    changes: { contest: string; delta: number }[];
    max: number;
    min: number;
    avgChange: number;
    largestIncrease: number;
    largestDecrease: number;
    volatility: number;
  };
  contest: {
    totalRatedContests: number;
    contestsLast30: number;
    contestsLast60: number;
    contestsLast90: number;
    avgRank: number;
    avgRatingChange: number;
    avgGapDays: number;
    maxGapDays: number;
    contestsPerMonth: { month: string; contests: number }[];
  };
  problemVolume: {
    solvedPerMonth: { month: string; solved: number }[];
    solveStreak: number;
    avgSolvesPerContest: number;
    totalUniqueSolved: number;
  };
  difficulty: {
    distribution: { band: string; count: number; percentage: number }[];
    highestSolvedRating: number;
    avgSolvedRating: number;
  };
  difficultyProgression: { month: string; avgRating: number; maxRating: number }[];
  upsolve: {
    totalUpsolves: number;
    upsolveRatio: number;
    upsolvesPerContest: number;
    byContest: { contest: string; upsolves: number }[];
  };
  tags: {
    uniqueTags: number;
    topTags: { tag: string; solved: number }[];
    leastTags: { tag: string; solved: number }[];
    radarTags: { tag: string; solved: number }[];
  };
  submissions: {
    total: number;
    accepted: number;
    successRate: number;
    avgAttemptsPerSolved: number;
    verdictBreakdown: { name: string; value: number }[];
    languageUsage: {
      language: string;
      submissions: number;
      accepted: number;
      successRate: number;
    }[];
    monthlySuccessRate: { month: string; successRate: number; submissions: number }[];
  };
  aboveRated: {
    aboveCount: number;
    belowCount: number;
    abovePct: number;
    avgGap: number;
  };
};

const darkTooltipProps = {
  contentStyle: {
    background: "#0c0a09",
    border: "1px solid #44403c",
    color: "#e7e5e4",
  },
  wrapperStyle: { outline: "none" as const },
  itemStyle: { color: "#e7e5e4" },
  labelStyle: { color: "#d6d3d1" },
};

function InfoHint({ text, label }: { text: string; label: string }) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!open) return;

    const onPointerDown = (event: MouseEvent) => {
      const target = event.target as Node;
      if (!rootRef.current?.contains(target)) {
        setOpen(false);
      }
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };

    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <span ref={rootRef} className="relative inline-flex">
      <button
        type="button"
        className="cursor-pointer text-zinc-500 hover:text-zinc-300"
        aria-label={`${label} info`}
        aria-expanded={open}
        onClick={() => setOpen((prev) => !prev)}
      >
        <Info className="h-3.5 w-3.5" />
      </button>
      {open ? (
        <div className="absolute left-1/2 top-full z-50 mt-2 w-52 -translate-x-1/2 rounded-md border border-zinc-700 bg-zinc-950 px-2 py-1.5 text-[10px] leading-snug text-zinc-200 shadow-lg">
          {text}
        </div>
      ) : null}
    </span>
  );
}

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

function CompactStat({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint?: string;
}) {
  return (
    <div className="rounded-md border border-zinc-800 bg-[#111] px-3 py-2">
      <div className="flex items-center gap-1">
        <p className="text-[10px] uppercase tracking-[0.14em] text-zinc-400">
          {label}
        </p>
        {hint ? (
          <InfoHint text={hint} label={label} />
        ) : null}
      </div>
      <p className="mt-1 text-sm font-semibold text-zinc-100">{value}</p>
    </div>
  );
}

function getRankColor(rank: string | null) {
  if (!rank) return "text-zinc-400";
  const r = rank.toLowerCase();
  if (r.includes("grandmaster")) return "text-red-500";
  if (r.includes("master")) return "text-orange-500";
  if (r.includes("candidate")) return "text-violet-500";
  if (r.includes("expert")) return "text-blue-500";
  if (r.includes("specialist")) return "text-cyan-500";
  if (r.includes("pupil")) return "text-green-500";
  return "text-zinc-400"; // Newbie/Unknown
}

export function AnalyticsDashboard({ data }: { data: AnalyticsViewModel }) {
  const registration = new Date(
    data.basic.registrationDate
  ).toLocaleDateString();

  const rankColor = getRankColor(data.basic.rank);

  return (
    <div className="min-h-screen bg-[#070707] p-4 text-zinc-100 sm:p-6 lg:p-8">
      <div className="pointer-events-none fixed inset-0 bg-[repeating-linear-gradient(-45deg,rgba(255,255,255,0.07)_0px,rgba(255,255,255,0.07)_1px,transparent_1px,transparent_7px)]" />

      <div className="relative mx-auto w-full max-w-[1600px] space-y-4">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <Card className="col-span-1 flex flex-col justify-between border-zinc-800 bg-[#111] p-6 font-mono md:col-span-2 xl:col-span-2">
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <h2
                  className={cn("text-4xl font-bold tracking-tight font-[family-name:var(--font-geist-pixel-square)]", rankColor)}
                >
                  {data.basic.handle}
                </h2>
                <div className="flex items-center gap-2 text-sm">
                  <span className="capitalize text-zinc-400">
                    {data.basic.rank || "unrated"}
                  </span>
                  {data.basic.organization && (
                    <>
                      <span className="text-zinc-700">•</span>
                      <span className="text-zinc-500">
                        {data.basic.organization}
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>

            <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
              <div className="space-y-1">
                <p className="text-[10px] uppercase tracking-wider text-zinc-500">
                  Registered
                </p>
                <p className="text-sm text-zinc-200">{registration}</p>
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-1">
                  <p className="text-[10px] uppercase tracking-wider text-zinc-500">
                    Contribution
                  </p>
                  <InfoHint
                    label="Contribution"
                    text="Codeforces contribution score from your profile."
                  />
                </div>
                <p className="text-sm text-zinc-200">
                  {data.basic.contribution}
                </p>
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-1">
                  <p className="text-[10px] uppercase tracking-wider text-zinc-500">
                    Max Increase
                  </p>
                  <InfoHint
                    label="Max Increase"
                    text="Largest positive rating change in a single rated contest."
                  />
                </div>
                <p className="text-sm text-emerald-400">
                  +{data.rating.largestIncrease}
                </p>
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-1">
                  <p className="text-[10px] uppercase tracking-wider text-zinc-500">
                    Max Decrease
                  </p>
                  <InfoHint
                    label="Max Decrease"
                    text="Largest negative rating change in a single rated contest."
                  />
                </div>
                <p className="text-sm text-rose-400">
                  {data.rating.largestDecrease}
                </p>
              </div>
            </div>
          </Card>

          <Card className="relative col-span-1 flex flex-col justify-center border-zinc-800 bg-[#111] p-6 font-mono md:col-span-2 xl:col-span-2">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <p className="text-[10px] uppercase tracking-wider text-zinc-500">
                  Current Rating
                </p>
                <Award className={cn("h-4 w-4", rankColor)} />
              </div>

              <div>
                <span
                  className={cn(
                    "text-6xl font-light tracking-tighter sm:text-7xl font-[family-name:var(--font-geist-pixel-square)]",
                    rankColor
                  )}
                >
                  {data.basic.currentRating ?? "N/A"}
                </span>
              </div>

              <div className="flex items-center justify-between pt-2 text-xs">
                <div className="space-y-0.5">
                  <p className="text-zinc-500">Max</p>
                  <p className="text-zinc-200">
                    {data.basic.maxRating ?? "N/A"}
                  </p>
                </div>
                <div className="space-y-0.5 text-right">
                  <div className="flex items-center justify-end gap-1">
                    <p className="text-zinc-500">To Max</p>
                    <InfoHint
                      label="To Max"
                      text="Current gap between your max rating and current rating."
                    />
                  </div>
                  <p className="flex items-center justify-end gap-1.5 text-zinc-200">
                    {data.basic.ratingDeltaFromMax}
                    {data.basic.ratingDeltaFromMax === 0 ? (
                      <Trophy className="h-3 w-3 text-yellow-500" />
                    ) : (
                      <TrendingUp className="h-3 w-3 text-zinc-600" />
                    )}
                  </p>
                </div>
              </div>
            </div>
          </Card>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          <Card className="col-span-1 border-zinc-800 bg-[#111] md:col-span-2 xl:col-span-2 min-h-[400px]">
            <CardHeader>
              <CardTitle className="text-zinc-100">Rating Trend</CardTitle>
              <CardDescription className="text-zinc-400">History over time.</CardDescription>
            </CardHeader>
            <CardContent className="h-[340px]">
              <PingingDotChart
                className="h-full border-none bg-transparent p-0"
                data={data.rating.trend.map((row) => ({
                  label: row.at,
                  value: row.rating,
                }))}
              />
            </CardContent>
          </Card>

          <Card className="col-span-1 border-zinc-800 bg-[#111] md:col-span-2 xl:col-span-2 min-h-[400px]">
             <CardHeader>
              <CardTitle className="text-zinc-100">Rating Deltas</CardTitle>
              <CardDescription className="text-zinc-400">Change per contest.</CardDescription>
            </CardHeader>
            <CardContent className="h-[340px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={data.rating.changes}
                    margin={{ left: 8, right: 8, top: 8, bottom: 8 }}
                  >
                    <CartesianGrid stroke="#27272a" strokeDasharray="3 3" />
                    <XAxis
                      dataKey="contest"
                      tick={false}
                      tickLine={false}
                      axisLine={{ stroke: "#3f3f46" }}
                    />
                    <YAxis
                      tick={{ fill: "#a1a1aa", fontSize: 11 }}
                      width={30}
                    />
                    <Tooltip
                      {...darkTooltipProps}
                      cursor={{ fill: "rgba(161,161,170,0.1)" }}
                    />
                    <Bar
                      dataKey="delta"
                      shape={<HatchedBarShape />}
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="col-span-1 border-zinc-800 bg-[#111] md:col-span-2 xl:col-span-2 min-h-[400px]">
            <CardHeader>
              <CardTitle className="text-zinc-100">Contest Stats</CardTitle>
              <CardDescription className="text-zinc-400">Frequency & gaps.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-1 flex-col justify-between p-6">
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 mb-4">
                  <CompactStat
                    label="Rated"
                    value={data.contest.totalRatedContests.toString()}
                    hint="Number of rated contests in your Codeforces rating history."
                  />
                  <CompactStat
                    label="Recent"
                    value={`${data.contest.contestsLast30}/${data.contest.contestsLast60}`}
                    hint="Contests played in the last 30 days / last 60 days."
                  />
                  <CompactStat
                    label="Avg Rank"
                    value={data.contest.avgRank.toFixed(0)}
                    hint="Average rank across all rated contests."
                  />
                </div>
                <div className="h-[200px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={data.contest.contestsPerMonth}
                      margin={{ left: 8, right: 8, top: 8, bottom: 8 }}
                    >
                      <CartesianGrid stroke="#27272a" strokeDasharray="3 3" />
                      <XAxis
                        dataKey="month"
                        tick={{ fill: "#a1a1aa", fontSize: 11 }}
                      />
                      <YAxis tick={{ fill: "#a1a1aa", fontSize: 11 }} width={30} />
                      <Tooltip
                        {...darkTooltipProps}
                        cursor={{ fill: "rgba(161,161,170,0.1)" }}
                      />
                      <Bar
                        dataKey="contests"
                        fill="#f97316"
                        shape={<HatchedBarShape />}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

          <Card className="col-span-1 border-zinc-800 bg-[#111] md:col-span-2 xl:col-span-2 min-h-[400px]">
            <CardHeader>
              <CardTitle className="text-zinc-100">Problem Volume</CardTitle>
              <CardDescription className="text-zinc-400">Daily solves & streak.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-1 flex-col justify-between p-6">
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 mb-4">
                  <CompactStat
                    label="Solved"
                    value={data.problemVolume.totalUniqueSolved.toString()}
                    hint="Unique problems solved with an accepted verdict."
                  />
                  <CompactStat
                    label="Streak"
                    value={`${data.problemVolume.solveStreak}d`}
                    hint="Longest run of consecutive days with at least one accepted solve."
                  />
                  <CompactStat
                    label="Avg/Contest"
                    value={data.problemVolume.avgSolvesPerContest.toFixed(1)}
                    hint="Unique solved problems divided by total rated contests."
                  />
                </div>
                <div className="h-[200px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={data.problemVolume.solvedPerMonth}
                      margin={{ left: 8, right: 8, top: 8, bottom: 8 }}
                    >
                      <CartesianGrid stroke="#27272a" strokeDasharray="3 3" />
                      <XAxis
                        dataKey="month"
                        tick={{ fill: "#a1a1aa", fontSize: 11 }}
                      />
                      <YAxis tick={{ fill: "#a1a1aa", fontSize: 11 }} width={30} />
                      <Tooltip {...darkTooltipProps} />
                      <Line
                        type="monotone"
                        dataKey="solved"
                        stroke="#22c55e"
                        strokeWidth={2.5}
                        dot={false}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

          <Card className="col-span-1 border-zinc-800 bg-[#111] min-h-[350px]">
            <CardHeader>
              <CardTitle className="text-zinc-100">Difficulty Dist.</CardTitle>
              <CardDescription className="text-zinc-400">Solved by rating.</CardDescription>
            </CardHeader>
            <CardContent className="h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={data.difficulty.distribution}
                    margin={{ left: 8, right: 8, top: 8, bottom: 8 }}
                  >
                    <CartesianGrid stroke="#27272a" strokeDasharray="3 3" />
                    <XAxis
                      dataKey="band"
                      tick={{ fill: "#a1a1aa", fontSize: 10 }}
                      interval={0}
                      angle={-20}
                      textAnchor="end"
                      height={40}
                    />
                    <YAxis tick={{ fill: "#a1a1aa", fontSize: 11 }} width={30} />
                    <Tooltip
                      {...darkTooltipProps}
                      cursor={{ fill: "rgba(161,161,170,0.1)" }}
                    />
                    <Bar
                      dataKey="count"
                      fill="#38bdf8"
                      shape={<HatchedBarShape />}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

          <Card className="col-span-1 border-zinc-800 bg-[#111] min-h-[350px]">
            <CardHeader>
              <CardTitle className="text-zinc-100">Tags</CardTitle>
              <CardDescription className="text-zinc-400">Top topics.</CardDescription>
            </CardHeader>
            <CardContent className="h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={data.tags.topTags.slice(0, 8)}
                    layout="vertical"
                    margin={{ left: 8, right: 8, top: 8, bottom: 8 }}
                  >
                    <CartesianGrid stroke="#27272a" strokeDasharray="3 3" />
                    <XAxis
                      type="number"
                      tick={{ fill: "#a1a1aa", fontSize: 11 }}
                      hide
                    />
                    <YAxis
                      type="category"
                      dataKey="tag"
                      tick={{ fill: "#a1a1aa", fontSize: 10 }}
                      width={56}
                    />
                    <Tooltip
                      {...darkTooltipProps}
                      cursor={{ fill: "rgba(161,161,170,0.1)" }}
                    />
                    <Bar
                      dataKey="solved"
                      fill="#38bdf8"
                      shape={<HatchedBarShape />}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

          <Card className="col-span-1 border-zinc-800 bg-[#111] min-h-[350px]">
            <CardHeader>
              <CardTitle className="text-zinc-100">Verdicts</CardTitle>
              <CardDescription className="text-zinc-400">Submission results.</CardDescription>
            </CardHeader>
            <CardContent className="h-[250px]">
            <IncreaseSizePieChart
              className="h-full border-none bg-transparent p-0"
              data={data.submissions.verdictBreakdown
                .slice(0, 6)
                .map((row, idx) => ({
                  name: row.name,
                  value: row.value,
                  fill: [
                    "#22c55e",
                    "#ef4444",
                    "#38bdf8",
                    "#f59e0b",
                    "#a78bfa",
                    "#f43f5e",
                  ][idx % 6],
                }))}
            />
            </CardContent>
          </Card>

          <Card className="col-span-1 border-zinc-800 bg-[#111] min-h-[350px]">
            <CardHeader>
              <CardTitle className="text-zinc-100">Languages</CardTitle>
              <CardDescription className="text-zinc-400">Usage stats.</CardDescription>
            </CardHeader>
            <CardContent className="h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={data.submissions.languageUsage.slice(0, 8)}
                    margin={{ left: 8, right: 8, top: 8, bottom: 8 }}
                  >
                    <CartesianGrid stroke="#27272a" strokeDasharray="3 3" />
                    <XAxis
                      dataKey="language"
                      tick={{ fill: "#a1a1aa", fontSize: 10 }}
                      interval={0}
                      angle={-20}
                      textAnchor="end"
                      height={50}
                    />
                    <YAxis tick={{ fill: "#a1a1aa", fontSize: 11 }} width={30} />
                    <Tooltip
                      {...darkTooltipProps}
                      cursor={{ fill: "rgba(161,161,170,0.1)" }}
                    />
                    <Bar
                      dataKey="submissions"
                      fill="#f59e0b"
                      shape={<HatchedBarShape />}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

          <Card className="col-span-1 border-zinc-800 bg-[#111] md:col-span-2 xl:col-span-2 min-h-[400px]">
            <CardHeader>
              <CardTitle className="text-zinc-100">Difficulty Trend</CardTitle>
              <CardDescription className="text-zinc-400">Avg & Max rating.</CardDescription>
            </CardHeader>
            <CardContent className="h-[390px] pb-10">
            <DottedMultiLineChart
              className="h-full border-none bg-transparent p-0"
              primaryLabel="Average Rating"
              secondaryLabel="Highest Rating"
              showSecondary
              data={data.difficultyProgression.map((row) => ({
                label: row.month,
                primary: row.avgRating,
                secondary: row.maxRating,
              }))}
            />
            </CardContent>
          </Card>

          <Card className="col-span-1 border-zinc-800 bg-[#111] md:col-span-2 xl:col-span-2 min-h-[400px]">
            <CardHeader>
              <CardTitle className="text-zinc-100">Upsolves</CardTitle>
              <CardDescription className="text-zinc-400">Practice activity.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-1 flex-col gap-4 p-6 pt-2">
                <div className="h-[280px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={data.upsolve.byContest}
                      margin={{ left: 8, right: 8, top: 8, bottom: 8 }}
                    >
                      <CartesianGrid stroke="#27272a" strokeDasharray="3 3" />
                      <XAxis dataKey="contest" hide />
                      <YAxis tick={{ fill: "#a1a1aa", fontSize: 11 }} width={30} />
                      <Tooltip
                        {...darkTooltipProps}
                        cursor={{ fill: "rgba(161,161,170,0.1)" }}
                      />
                      <Bar
                        dataKey="upsolves"
                        fill="#a78bfa"
                        shape={<HatchedBarShape />}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <CompactStat
                    label="Total"
                    value={data.upsolve.totalUpsolves.toString()}
                    hint="Accepted solves done after contest end, only for contests you participated in."
                  />
                  <CompactStat
                    label="Ratio"
                    value={`${(data.upsolve.upsolveRatio * 100).toFixed(0)}%`}
                    hint="Total upsolves divided by total unique solved problems."
                  />
                  <CompactStat
                    label="Per Contest"
                    value={data.upsolve.upsolvesPerContest.toFixed(1)}
                    hint="Total upsolves divided by your total rated contests."
                  />
                </div>
              </CardContent>
            </Card>

          <Card className="col-span-1 border-zinc-800 bg-[#111] md:col-span-2 xl:col-span-2 min-h-[400px]">
            <CardHeader>
              <CardTitle className="text-zinc-100">Accuracy</CardTitle>
              <CardDescription className="text-zinc-400">Monthly success rate.</CardDescription>
            </CardHeader>
            <CardContent className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={data.submissions.monthlySuccessRate}
                    margin={{ left: 8, right: 8, top: 8, bottom: 8 }}
                  >
                    <CartesianGrid stroke="#27272a" strokeDasharray="3 3" />
                    <XAxis
                      dataKey="month"
                      tick={{ fill: "#a1a1aa", fontSize: 11 }}
                    />
                    <YAxis
                      tick={{ fill: "#a1a1aa", fontSize: 11 }}
                      domain={[0, 100]}
                      width={30}
                    />
                    <Tooltip {...darkTooltipProps} />
                    <Line
                      type="monotone"
                      dataKey="successRate"
                      stroke="#22c55e"
                      strokeWidth={2.5}
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

          <Card className="col-span-1 border-zinc-800 bg-[#111] md:col-span-2 xl:col-span-2 min-h-[400px]">
            <CardHeader>
              <CardTitle className="text-zinc-100">Above Rated</CardTitle>
              <CardDescription className="text-zinc-400">Pushing limits.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-1 flex-col justify-between">
                <div className="grid grid-cols-3 gap-2 mb-4">
                  <CompactStat
                    label="Count"
                    value={data.aboveRated.aboveCount.toString()}
                    hint="Solved problems whose rating is above your current rating."
                  />
                  <CompactStat
                    label="Percentage"
                    value={`${data.aboveRated.abovePct.toFixed(1)}%`}
                    hint="Above-rated solved count divided by total unique solved problems."
                  />
                  <CompactStat
                    label="Avg Gap"
                    value={data.aboveRated.avgGap.toFixed(1)}
                    hint="Average rating difference for above-rated solved problems."
                  />
                </div>
                <div className="h-[200px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={[
                        { bucket: "Below", value: data.aboveRated.belowCount },
                        { bucket: "Above", value: data.aboveRated.aboveCount },
                      ]}
                      layout="vertical"
                      margin={{ left: 8, right: 8, top: 8, bottom: 8 }}
                    >
                      <CartesianGrid stroke="#27272a" strokeDasharray="3 3" />
                      <XAxis type="number" hide />
                      <YAxis
                        type="category"
                        dataKey="bucket"
                        tick={{ fill: "#a1a1aa", fontSize: 11 }}
                        width={30}
                      />
                      <Tooltip
                        {...darkTooltipProps}
                        cursor={{ fill: "rgba(161,161,170,0.1)" }}
                      />
                      <Bar
                        dataKey="value"
                        fill="#ef4444"
                        shape={<HatchedBarShape />}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
        </div>
      </div>
    </div>
  );
}
