"use client";

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
  TrendingDown,
  Activity,
  Award,
  Hash,
  Target,
  Trophy,
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

function CompactStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-zinc-800 bg-[#171717] px-3 py-2">
      <p className="text-[10px] uppercase tracking-[0.14em] text-zinc-400">
        {label}
      </p>
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
        {/* Header / Profile Stats Row */}
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {/* Profile Card */}
          <Card className="col-span-1 flex flex-col justify-between border-zinc-800 bg-[#171717] p-6 font-mono md:col-span-2 xl:col-span-2">
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
                <p className="text-[10px] uppercase tracking-wider text-zinc-500">
                  Contribution
                </p>
                <p className="text-sm text-zinc-200">
                  {data.basic.contribution}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] uppercase tracking-wider text-zinc-500">
                  Max Increase
                </p>
                <p className="text-sm text-emerald-400">
                  +{data.rating.largestIncrease}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] uppercase tracking-wider text-zinc-500">
                  Max Decrease
                </p>
                <p className="text-sm text-rose-400">
                  {data.rating.largestDecrease}
                </p>
              </div>
            </div>
          </Card>

          {/* Rating Card */}
          <Card className="relative col-span-1 flex flex-col justify-center border-zinc-800 bg-[#171717] p-6 font-mono md:col-span-2 xl:col-span-2">
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
                  <p className="text-zinc-500">To Max</p>
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

        {/* Main Grid */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          <Card className="col-span-1 border-zinc-800 bg-[#171717] md:col-span-2 xl:col-span-2 min-h-[400px]">
            <CardHeader>
              <CardTitle className="text-zinc-100">Rating Trend</CardTitle>
              <CardDescription className="text-zinc-400">History over time.</CardDescription>
            </CardHeader>
            <CardContent className="h-[300px]">
              <PingingDotChart
                className="h-full border-none bg-transparent p-0"
                data={data.rating.trend.map((row) => ({
                  label: row.at,
                  value: row.rating,
                }))}
              />
            </CardContent>
          </Card>

          <Card className="col-span-1 border-zinc-800 bg-[#171717] md:col-span-2 xl:col-span-2 min-h-[400px]">
             <CardHeader>
              <CardTitle className="text-zinc-100">Rating Deltas</CardTitle>
              <CardDescription className="text-zinc-400">Change per contest.</CardDescription>
            </CardHeader>
            <CardContent className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data.rating.changes}>
                    <CartesianGrid stroke="#27272a" strokeDasharray="3 3" />
                    <XAxis dataKey="contest" hide />
                    <YAxis
                      tick={{ fill: "#a1a1aa", fontSize: 11 }}
                      width={44}
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

          <Card className="col-span-1 border-zinc-800 bg-[#171717] md:col-span-2 xl:col-span-2 min-h-[400px]">
            <CardHeader>
              <CardTitle className="text-zinc-100">Contest Stats</CardTitle>
              <CardDescription className="text-zinc-400">Frequency & gaps.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-1 flex-col justify-between p-6">
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 mb-4">
                  <CompactStat
                    label="Rated"
                    value={data.contest.totalRatedContests.toString()}
                  />
                  <CompactStat
                    label="Recent"
                    value={`${data.contest.contestsLast30}/${data.contest.contestsLast60}`}
                  />
                  <CompactStat
                    label="Avg Rank"
                    value={data.contest.avgRank.toFixed(0)}
                  />
                </div>
                <div className="h-[200px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data.contest.contestsPerMonth}>
                      <CartesianGrid stroke="#27272a" strokeDasharray="3 3" />
                      <XAxis
                        dataKey="month"
                        tick={{ fill: "#a1a1aa", fontSize: 11 }}
                      />
                      <YAxis tick={{ fill: "#a1a1aa", fontSize: 11 }} />
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

          <Card className="col-span-1 border-zinc-800 bg-[#171717] md:col-span-2 xl:col-span-2 min-h-[400px]">
            <CardHeader>
              <CardTitle className="text-zinc-100">Problem Volume</CardTitle>
              <CardDescription className="text-zinc-400">Daily solves & streak.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-1 flex-col justify-between p-6">
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 mb-4">
                  <CompactStat
                    label="Solved"
                    value={data.problemVolume.totalUniqueSolved.toString()}
                  />
                  <CompactStat
                    label="Streak"
                    value={`${data.problemVolume.solveStreak}d`}
                  />
                  <CompactStat
                    label="Avg/Contest"
                    value={data.problemVolume.avgSolvesPerContest.toFixed(1)}
                  />
                </div>
                <div className="h-[200px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={data.problemVolume.solvedPerMonth}>
                      <CartesianGrid stroke="#27272a" strokeDasharray="3 3" />
                      <XAxis
                        dataKey="month"
                        tick={{ fill: "#a1a1aa", fontSize: 11 }}
                      />
                      <YAxis tick={{ fill: "#a1a1aa", fontSize: 11 }} />
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

          <Card className="col-span-1 border-zinc-800 bg-[#171717] min-h-[350px]">
            <CardHeader>
              <CardTitle className="text-zinc-100">Difficulty Dist.</CardTitle>
              <CardDescription className="text-zinc-400">Solved by rating.</CardDescription>
            </CardHeader>
            <CardContent className="h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data.difficulty.distribution}>
                    <CartesianGrid stroke="#27272a" strokeDasharray="3 3" />
                    <XAxis
                      dataKey="band"
                      tick={{ fill: "#a1a1aa", fontSize: 10 }}
                      interval={0}
                      angle={-20}
                      textAnchor="end"
                      height={40}
                    />
                    <YAxis tick={{ fill: "#a1a1aa", fontSize: 11 }} />
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

          <Card className="col-span-1 border-zinc-800 bg-[#171717] min-h-[350px]">
            <CardHeader>
              <CardTitle className="text-zinc-100">Tags</CardTitle>
              <CardDescription className="text-zinc-400">Top topics.</CardDescription>
            </CardHeader>
            <CardContent className="h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={data.tags.topTags.slice(0, 8)}
                    layout="vertical"
                    margin={{ left: 0, right: 0 }}
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
                      width={80}
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

          <Card className="col-span-1 border-zinc-800 bg-[#171717] min-h-[350px]">
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

          <Card className="col-span-1 border-zinc-800 bg-[#171717] min-h-[350px]">
            <CardHeader>
              <CardTitle className="text-zinc-100">Languages</CardTitle>
              <CardDescription className="text-zinc-400">Usage stats.</CardDescription>
            </CardHeader>
            <CardContent className="h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data.submissions.languageUsage.slice(0, 8)}>
                    <CartesianGrid stroke="#27272a" strokeDasharray="3 3" />
                    <XAxis
                      dataKey="language"
                      tick={{ fill: "#a1a1aa", fontSize: 10 }}
                      interval={0}
                      angle={-20}
                      textAnchor="end"
                      height={50}
                    />
                    <YAxis tick={{ fill: "#a1a1aa", fontSize: 11 }} />
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

          <Card className="col-span-1 border-zinc-800 bg-[#171717] md:col-span-2 xl:col-span-2 min-h-[400px]">
            <CardHeader>
              <CardTitle className="text-zinc-100">Difficulty Trend</CardTitle>
              <CardDescription className="text-zinc-400">Avg & Max rating.</CardDescription>
            </CardHeader>
            <CardContent className="h-[300px]">
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

          <Card className="col-span-1 border-zinc-800 bg-[#171717] md:col-span-2 xl:col-span-2 min-h-[400px]">
            <CardHeader>
              <CardTitle className="text-zinc-100">Upsolves</CardTitle>
              <CardDescription className="text-zinc-400">Practice activity.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-1 flex-col justify-between p-6">
                <div className="grid grid-cols-3 gap-2 mb-4">
                  <CompactStat
                    label="Total"
                    value={data.upsolve.totalUpsolves.toString()}
                  />
                  <CompactStat
                    label="Ratio"
                    value={`${(data.upsolve.upsolveRatio * 100).toFixed(0)}%`}
                  />
                  <CompactStat
                    label="Per Contest"
                    value={data.upsolve.upsolvesPerContest.toFixed(1)}
                  />
                </div>
                <div className="h-[200px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data.upsolve.byContest.slice(0, 15)}>
                      <CartesianGrid stroke="#27272a" strokeDasharray="3 3" />
                      <XAxis dataKey="contest" hide />
                      <YAxis tick={{ fill: "#a1a1aa", fontSize: 11 }} />
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
              </CardContent>
            </Card>

          <Card className="col-span-1 border-zinc-800 bg-[#171717] md:col-span-2 xl:col-span-2 min-h-[400px]">
            <CardHeader>
              <CardTitle className="text-zinc-100">Accuracy</CardTitle>
              <CardDescription className="text-zinc-400">Monthly success rate.</CardDescription>
            </CardHeader>
            <CardContent className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={data.submissions.monthlySuccessRate}>
                    <CartesianGrid stroke="#27272a" strokeDasharray="3 3" />
                    <XAxis
                      dataKey="month"
                      tick={{ fill: "#a1a1aa", fontSize: 11 }}
                    />
                    <YAxis
                      tick={{ fill: "#a1a1aa", fontSize: 11 }}
                      domain={[0, 100]}
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

          <Card className="col-span-1 border-zinc-800 bg-[#171717] md:col-span-2 xl:col-span-2 min-h-[400px]">
            <CardHeader>
              <CardTitle className="text-zinc-100">Above Rated</CardTitle>
              <CardDescription className="text-zinc-400">Pushing limits.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-1 flex-col justify-between">
                <div className="grid grid-cols-3 gap-2 mb-4">
                  <CompactStat
                    label="Count"
                    value={data.aboveRated.aboveCount.toString()}
                  />
                  <CompactStat
                    label="Percentage"
                    value={`${data.aboveRated.abovePct.toFixed(1)}%`}
                  />
                  <CompactStat
                    label="Avg Gap"
                    value={data.aboveRated.avgGap.toFixed(1)}
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
                    >
                      <CartesianGrid stroke="#27272a" strokeDasharray="3 3" />
                      <XAxis type="number" hide />
                      <YAxis
                        type="category"
                        dataKey="bucket"
                        tick={{ fill: "#a1a1aa", fontSize: 11 }}
                        width={40}
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