"use client";

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
} from "lucide-react";

import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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

function ChartSection({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-[50vh] flex flex-col justify-center space-y-4">
      <div>
        <h3 className="text-lg font-medium leading-none text-zinc-100">
          {title}
        </h3>
        <p className="mt-1.5 max-w-2xl text-sm text-zinc-400">
          {description}
        </p>
      </div>
      {children}
    </div>
  );
}

export function AnalyticsDashboard({ data }: { data: AnalyticsViewModel }) {
  const registration = new Date(
    data.basic.registrationDate
  ).toLocaleDateString();

  const rankColor = getRankColor(data.basic.rank);

  return (
    <div className="relative min-h-screen bg-[#070707] p-4 text-zinc-100 sm:p-8">
      <div className="pointer-events-none absolute inset-0 bg-[repeating-linear-gradient(-45deg,rgba(255,255,255,0.02)_0px,rgba(255,255,255,0.02)_1px,transparent_1px,transparent_7px)]" />
      
      <div className="relative mx-auto w-full max-w-5xl space-y-32">
        {/* Hero Section */}
        <div className="grid gap-4 md:grid-cols-3">
          {/* Profile Card */}
          <Card className="col-span-2 flex flex-col justify-between border-zinc-800 bg-[#171717] p-8 font-mono md:col-span-2">
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <h2 className={cn("text-4xl font-bold tracking-tight", rankColor)}>
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

            <div className="mt-10 grid grid-cols-2 gap-8 sm:grid-cols-4">
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
          <Card className="relative flex flex-col justify-center border-zinc-800 bg-[#171717] p-8 font-mono">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <p className="text-[10px] uppercase tracking-wider text-zinc-500">
                  Current Rating
                </p>
                <Award className={cn("h-4 w-4", rankColor)} />
              </div>
              
              <div>
                <span className={cn("text-7xl font-light tracking-tighter", rankColor)}>
                  {data.basic.currentRating ?? "N/A"}
                </span>
              </div>

              <div className="flex items-center justify-between pt-2 text-xs">
                <div className="space-y-0.5">
                  <p className="text-zinc-500">Max</p>
                  <p className="text-zinc-200">{data.basic.maxRating ?? "N/A"}</p>
                </div>
                <div className="text-right space-y-0.5">
                  <p className="text-zinc-500">To Max</p>
                  <p className="text-zinc-200 flex items-center justify-end gap-1.5">
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

        <div className="space-y-32">
          <ChartSection
            title="Rating Trend Over Time"
            description="Contest timeline and rating evolution."
          >
            <PingingDotChart
              data={data.rating.trend.map((row) => ({
                label: row.at,
                value: row.rating,
              }))}
            />
          </ChartSection>

          <ChartSection
            title="Rating Change Per Contest"
            description="History of rating deltas across all participated contests."
          >
            <Card className="border-zinc-800 bg-[#171717]">
              <CardContent className="h-96 p-6">
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
          </ChartSection>

          <ChartSection
            title="Contest Participation Analytics"
            description="Breakdown of contest frequency and gap analysis."
          >
            <Card className="border-zinc-800 bg-[#171717]">
              <CardContent className="space-y-6 p-6">
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  <CompactStat
                    label="Rated Contests"
                    value={data.contest.totalRatedContests.toString()}
                  />
                  <CompactStat
                    label="Last 30 / 60 / 90"
                    value={`${data.contest.contestsLast30} / ${data.contest.contestsLast60} / ${data.contest.contestsLast90}`}
                  />
                  <CompactStat
                    label="Avg Rank"
                    value={data.contest.avgRank.toFixed(1)}
                  />
                  <CompactStat
                    label="Avg Rating Change"
                    value={data.contest.avgRatingChange.toFixed(2)}
                  />
                  <CompactStat
                    label="Avg Gap (days)"
                    value={data.contest.avgGapDays.toFixed(1)}
                  />
                  <CompactStat
                    label="Max Gap (days)"
                    value={data.contest.maxGapDays.toFixed(1)}
                  />
                </div>
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data.contest.contestsPerMonth}>
                      <CartesianGrid stroke="#27272a" strokeDasharray="3 3" />
                      <XAxis
                        dataKey="month"
                        tick={{ fill: "#a1a1aa", fontSize: 11 }}
                      />
                      <YAxis tick={{ fill: "#a1a1aa", fontSize: 11 }} />
                      <Tooltip {...darkTooltipProps} />
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
          </ChartSection>

          <ChartSection
            title="Problem Solving Volume"
            description="Daily solve counts and cumulative streak tracking."
          >
            <Card className="border-zinc-800 bg-[#171717]">
              <CardContent className="space-y-6 p-6">
                <div className="grid gap-4 sm:grid-cols-3">
                  <CompactStat
                    label="Unique Solved"
                    value={data.problemVolume.totalUniqueSolved.toString()}
                  />
                  <CompactStat
                    label="Solve Streak"
                    value={`${data.problemVolume.solveStreak} days`}
                  />
                  <CompactStat
                    label="Avg Solves/Contest"
                    value={data.problemVolume.avgSolvesPerContest.toFixed(2)}
                  />
                </div>
                <div className="h-72">
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
          </ChartSection>

          <ChartSection
            title="Difficulty Distribution"
            description="Distribution of solved problems by rating tier."
          >
            <Card className="border-zinc-800 bg-[#171717]">
              <CardContent className="space-y-6 p-6">
                <div className="grid gap-4 sm:grid-cols-2">
                  <CompactStat
                    label="Highest Solved"
                    value={data.difficulty.highestSolvedRating.toString()}
                  />
                  <CompactStat
                    label="Avg Solved Rating"
                    value={data.difficulty.avgSolvedRating.toFixed(1)}
                  />
                </div>
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data.difficulty.distribution}>
                      <CartesianGrid stroke="#27272a" strokeDasharray="3 3" />
                      <XAxis
                        dataKey="band"
                        tick={{ fill: "#a1a1aa", fontSize: 11 }}
                      />
                      <YAxis tick={{ fill: "#a1a1aa", fontSize: 11 }} />
                      <Tooltip {...darkTooltipProps} />
                      <Bar
                        dataKey="count"
                        fill="#38bdf8"
                        shape={<HatchedBarShape />}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </ChartSection>

          <ChartSection
            title="Difficulty Progression Over Time"
            description="Average and highest solved rating by month."
          >
            <DottedMultiLineChart
              primaryLabel="Average Rating"
              secondaryLabel="Highest Rating"
              showSecondary
              data={data.difficultyProgression.map((row) => ({
                label: row.month,
                primary: row.avgRating,
                secondary: row.maxRating,
              }))}
            />
          </ChartSection>

          <ChartSection
            title="Upsolve Analytics"
            description="Practice problems solved after contest duration."
          >
            <Card className="border-zinc-800 bg-[#171717]">
              <CardContent className="space-y-6 p-6">
                <div className="grid gap-4 sm:grid-cols-3">
                  <CompactStat
                    label="Total Upsolves"
                    value={data.upsolve.totalUpsolves.toString()}
                  />
                  <CompactStat
                    label="Upsolve Ratio"
                    value={`${(data.upsolve.upsolveRatio * 100).toFixed(1)}%`}
                  />
                  <CompactStat
                    label="Upsolves / Contest"
                    value={data.upsolve.upsolvesPerContest.toFixed(2)}
                  />
                </div>
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data.upsolve.byContest.slice(0, 12)}>
                      <CartesianGrid stroke="#27272a" strokeDasharray="3 3" />
                      <XAxis dataKey="contest" hide />
                      <YAxis tick={{ fill: "#a1a1aa", fontSize: 11 }} />
                      <Tooltip {...darkTooltipProps} />
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
          </ChartSection>

          <ChartSection
            title="Submission Verdict Proportions"
            description="Proportional verdict split from profile submissions."
          >
            <IncreaseSizePieChart
              data={data.submissions.verdictBreakdown.slice(0, 8).map((row, idx) => ({
                name: row.name,
                value: row.value,
                fill: [
                  "#22c55e",
                  "#ef4444",
                  "#38bdf8",
                  "#f59e0b",
                  "#a78bfa",
                  "#f43f5e",
                  "#06b6d4",
                  "#84cc16",
                ][idx % 8],
              }))}
            />
          </ChartSection>



          <ChartSection
            title="Tag Coverage"
            description="Performance across different algorithmic topics."
          >
            <Card className="border-zinc-800 bg-[#171717]">
              <CardContent className="space-y-6 p-6">
                <div className="grid gap-4 sm:grid-cols-2">
                  <CompactStat
                    label="Unique Tags"
                    value={data.tags.uniqueTags.toString()}
                  />
                  <CompactStat
                    label="Least Practiced"
                    value={
                      data.tags.leastTags
                        .slice(0, 3)
                        .map((t) => t.tag)
                        .join(", ") || "-"
                    }
                  />
                </div>
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={data.tags.topTags}
                      layout="vertical"
                      margin={{ left: 12, right: 16 }}
                    >
                      <CartesianGrid stroke="#27272a" strokeDasharray="3 3" />
                      <XAxis
                        type="number"
                        tick={{ fill: "#a1a1aa", fontSize: 11 }}
                      />
                      <YAxis
                        type="category"
                        dataKey="tag"
                        tick={{ fill: "#a1a1aa", fontSize: 11 }}
                        width={120}
                      />
                      <Tooltip {...darkTooltipProps} />
                      <Bar
                        dataKey="solved"
                        fill="#38bdf8"
                        shape={<HatchedBarShape />}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </ChartSection>

          <ChartSection
            title="Submission Efficiency & Language Usage"
            description="Language usage and attempts per solved problem."
          >
            <Card className="border-zinc-800 bg-[#171717]">
              <CardContent className="space-y-6 p-6">
                <div className="grid gap-4 sm:grid-cols-2">
                  <CompactStat
                    label="Total Submissions"
                    value={data.submissions.total.toString()}
                  />
                  <CompactStat
                    label="Accepted"
                    value={data.submissions.accepted.toString()}
                  />
                  <CompactStat
                    label="Success Rate"
                    value={`${data.submissions.successRate.toFixed(1)}%`}
                  />
                  <CompactStat
                    label="Avg Attempts/Solved"
                    value={data.submissions.avgAttemptsPerSolved.toFixed(2)}
                  />
                </div>
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data.submissions.languageUsage}>
                      <CartesianGrid stroke="#27272a" strokeDasharray="3 3" />
                      <XAxis
                        dataKey="language"
                        tick={{ fill: "#a1a1aa", fontSize: 10 }}
                        interval={0}
                        angle={-20}
                        textAnchor="end"
                        height={70}
                      />
                      <YAxis tick={{ fill: "#a1a1aa", fontSize: 11 }} />
                      <Tooltip {...darkTooltipProps} />
                      <Bar
                        dataKey="submissions"
                        fill="#f59e0b"
                        shape={<HatchedBarShape />}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </ChartSection>

          <ChartSection
            title="Accuracy Over Time"
            description="Success rate trends on a monthly basis."
          >
            <Card className="border-zinc-800 bg-[#171717]">
              <CardContent className="h-96 p-6">
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
          </ChartSection>

          <ChartSection
            title="Above-Rated Problem Analysis"
            description="Performance on problems rated higher than current rating."
          >
            <Card className="border-zinc-800 bg-[#171717]">
              <CardContent className="space-y-6 p-6">
                <div className="grid gap-4 sm:grid-cols-3">
                  <CompactStat
                    label="Above-Rated"
                    value={data.aboveRated.aboveCount.toString()}
                  />
                  <CompactStat
                    label="Above-Rated %"
                    value={`${data.aboveRated.abovePct.toFixed(1)}%`}
                  />
                  <CompactStat
                    label="Avg Gap"
                    value={data.aboveRated.avgGap.toFixed(1)}
                  />
                </div>
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={[
                        { bucket: "Below", value: data.aboveRated.belowCount },
                        { bucket: "Above", value: data.aboveRated.aboveCount },
                      ]}
                    >
                      <CartesianGrid stroke="#27272a" strokeDasharray="3 3" />
                      <XAxis
                        dataKey="bucket"
                        tick={{ fill: "#a1a1aa", fontSize: 11 }}
                      />
                      <YAxis tick={{ fill: "#a1a1aa", fontSize: 11 }} />
                      <Tooltip {...darkTooltipProps} />
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
          </ChartSection>
        </div>
      </div>
    </div>
  );
}
