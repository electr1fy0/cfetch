import { auth } from "@/auth";
import {
  AnalyticsDashboard,
  type AnalyticsViewModel,
} from "@/components/analytics-dashboard";

type CFResponse<T> = {
  status: "OK" | "FAILED";
  comment?: string;
  result: T;
};

type CFUser = {
  handle: string;
  rating?: number;
  maxRating?: number;
  rank?: string;
  contribution: number;
  organization?: string;
  registrationTimeSeconds: number;
};

type CFRatingChange = {
  contestId: number;
  contestName: string;
  rank: number;
  newRating: number;
  oldRating: number;
  ratingUpdateTimeSeconds: number;
};

type CFProblem = {
  contestId?: number;
  index?: string;
  name?: string;
  rating?: number;
  tags?: string[];
};

type CFSubmission = {
  creationTimeSeconds: number;
  verdict?: string;
  programmingLanguage?: string;
  problem?: CFProblem;
};

type CFContest = {
  id: number;
  name: string;
  startTimeSeconds?: number;
  durationSeconds?: number;
  relativeTimeSeconds: number;
};

function toDate(tsSeconds: number): Date {
  return new Date(tsSeconds * 1000);
}

function monthKey(tsSeconds: number): string {
  const date = toDate(tsSeconds);
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}`;
}

function dayKey(tsSeconds: number): string {
  const date = toDate(tsSeconds);
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}-${String(date.getUTCDate()).padStart(2, "0")}`;
}

async function cfFetch<T>(url: string): Promise<T> {
  const res = await fetch(url, {
    next: { revalidate: 180 },
    headers: {
      Accept: "application/json",
      "User-Agent": "cfetch/1.0 (+https://localhost)",
    },
  });

  if (!res.ok) {
    throw new Error(`Codeforces API request failed (${res.status})`);
  }

  const payload = (await res.json()) as CFResponse<T>;
  if (payload.status !== "OK") {
    throw new Error(payload.comment ?? "Codeforces API returned FAILED");
  }

  return payload.result;
}

function standardDeviation(values: number[]): number {
  if (values.length === 0) return 0;
  const mean = values.reduce((sum, v) => sum + v, 0) / values.length;
  const variance =
    values.reduce((sum, v) => sum + (v - mean) ** 2, 0) / values.length;
  return Math.sqrt(variance);
}

function buildModel(
  user: CFUser,
  rating: CFRatingChange[],
  submissionsRaw: CFSubmission[],
  contests: CFContest[],
): AnalyticsViewModel {
  const nowSeconds = Math.floor(Date.now() / 1000);

  const ratingSorted = [...rating].sort(
    (a, b) => a.ratingUpdateTimeSeconds - b.ratingUpdateTimeSeconds,
  );
  const submissions = [...submissionsRaw].sort(
    (a, b) => a.creationTimeSeconds - b.creationTimeSeconds,
  );

  const contestByID = new Map<number, CFContest>();
  for (const contest of contests) {
    contestByID.set(contest.id, contest);
  }

  const ratingDeltas = ratingSorted.map((r) => r.newRating - r.oldRating);
  const ratingTrend = ratingSorted.map((row) => ({
    label: row.contestName,
    rating: row.newRating,
    delta: row.newRating - row.oldRating,
    at: toDate(row.ratingUpdateTimeSeconds).toLocaleDateString(),
  }));

  const ratingStats = {
    max: ratingSorted.length
      ? Math.max(...ratingSorted.map((r) => r.newRating))
      : (user.rating ?? 0),
    min: ratingSorted.length
      ? Math.min(...ratingSorted.map((r) => r.newRating))
      : (user.rating ?? 0),
    avgDelta:
      ratingDeltas.length > 0
        ? ratingDeltas.reduce((sum, d) => sum + d, 0) / ratingDeltas.length
        : 0,
    largestIncrease: ratingDeltas.length ? Math.max(...ratingDeltas) : 0,
    largestDecrease: ratingDeltas.length ? Math.min(...ratingDeltas) : 0,
    volatility: standardDeviation(ratingDeltas),
  };

  const ratingChangeBars = ratingSorted.slice(-50).map((row) => ({
    contest: row.contestName,
    delta: row.newRating - row.oldRating,
  }));

  const contestsInLast = (days: number) => {
    const threshold = nowSeconds - days * 86400;
    return ratingSorted.filter((r) => r.ratingUpdateTimeSeconds >= threshold)
      .length;
  };

  const avgRank =
    ratingSorted.length > 0
      ? ratingSorted.reduce((sum, r) => sum + r.rank, 0) / ratingSorted.length
      : 0;

  const contestMonthMap = new Map<string, number>();
  for (const row of ratingSorted) {
    const key = monthKey(row.ratingUpdateTimeSeconds);
    contestMonthMap.set(key, (contestMonthMap.get(key) ?? 0) + 1);
  }
  const contestsPerMonth = [...contestMonthMap.entries()]
    .map(([month, contestsCount]) => ({ month, contests: contestsCount }))
    .sort((a, b) => a.month.localeCompare(b.month));

  const gapsDays: number[] = [];
  for (let i = 1; i < ratingSorted.length; i++) {
    const gap =
      (ratingSorted[i].ratingUpdateTimeSeconds -
        ratingSorted[i - 1].ratingUpdateTimeSeconds) /
      86400;
    gapsDays.push(gap);
  }

  const contestParticipation = {
    totalRatedContests: ratingSorted.length,
    contestsLast30: contestsInLast(30),
    contestsLast60: contestsInLast(60),
    contestsLast90: contestsInLast(90),
    avgRank,
    avgRatingChange: ratingStats.avgDelta,
    avgGapDays:
      gapsDays.length > 0
        ? gapsDays.reduce((sum, g) => sum + g, 0) / gapsDays.length
        : 0,
    maxGapDays: gapsDays.length > 0 ? Math.max(...gapsDays) : 0,
    contestsPerMonth,
  };

  const verdictCountsMap = new Map<string, number>();
  const languageMap = new Map<
    string,
    { submissions: number; accepted: number }
  >();
  const monthlySubmissionsMap = new Map<
    string,
    { total: number; accepted: number }
  >();

  for (const sub of submissions) {
    const verdict = sub.verdict ?? "UNKNOWN";
    verdictCountsMap.set(verdict, (verdictCountsMap.get(verdict) ?? 0) + 1);

    const lang = sub.programmingLanguage?.trim() || "Unknown";
    const langEntry = languageMap.get(lang) ?? { submissions: 0, accepted: 0 };
    langEntry.submissions += 1;
    if (verdict === "OK") langEntry.accepted += 1;
    languageMap.set(lang, langEntry);

    const month = monthKey(sub.creationTimeSeconds);
    const monthEntry = monthlySubmissionsMap.get(month) ?? {
      total: 0,
      accepted: 0,
    };
    monthEntry.total += 1;
    if (verdict === "OK") monthEntry.accepted += 1;
    monthlySubmissionsMap.set(month, monthEntry);
  }

  const verdictBreakdown = [...verdictCountsMap.entries()]
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);

  const languageUsage = [...languageMap.entries()]
    .map(([language, value]) => ({
      language,
      submissions: value.submissions,
      accepted: value.accepted,
      successRate:
        value.submissions > 0 ? (value.accepted / value.submissions) * 100 : 0,
    }))
    .sort((a, b) => b.submissions - a.submissions)
    .slice(0, 12);

  const monthlySuccessRate = [...monthlySubmissionsMap.entries()]
    .map(([month, value]) => ({
      month,
      successRate: value.total > 0 ? (value.accepted / value.total) * 100 : 0,
      submissions: value.total,
    }))
    .sort((a, b) => a.month.localeCompare(b.month));

  const solvedMap = new Map<string, CFSubmission>();
  const attemptsMap = new Map<string, number>();
  for (const sub of submissions) {
    const problem = sub.problem;
    if (!problem) continue;
    const key = `${problem.contestId ?? ""}-${problem.index ?? ""}`;
    attemptsMap.set(key, (attemptsMap.get(key) ?? 0) + 1);
    if (sub.verdict === "OK" && !solvedMap.has(key)) {
      solvedMap.set(key, sub);
    }
  }

  const solved = [...solvedMap.values()];
  const solvedCount = solved.length;

  const solvedPerMonthMap = new Map<string, number>();
  const solvedDaySet = new Set<string>();
  const solvedRatingByMonthMap = new Map<
    string,
    { total: number; count: number; max: number }
  >();
  const tagFrequencyMap = new Map<string, number>();
  const upsolveByContestMap = new Map<string, number>();

  const difficultyBands: Record<string, number> = {
    "<1100": 0,
    "1100-1399": 0,
    "1400-1699": 0,
    "1700-1999": 0,
    "2000+": 0,
  };

  let solvedWithRating = 0;
  let solvedRatingSum = 0;
  let highestSolvedRating = 0;
  let aboveRatedSolved = 0;
  let aboveRatedGapSum = 0;
  let totalUpsolves = 0;

  for (const sub of solved) {
    const ts = sub.creationTimeSeconds;
    const problem = sub.problem;
    if (!problem) continue;

    solvedPerMonthMap.set(
      monthKey(ts),
      (solvedPerMonthMap.get(monthKey(ts)) ?? 0) + 1,
    );
    solvedDaySet.add(dayKey(ts));

    for (const tag of problem.tags ?? []) {
      tagFrequencyMap.set(tag, (tagFrequencyMap.get(tag) ?? 0) + 1);
    }

    const contestId = problem.contestId;
    if (typeof contestId === "number") {
      const contest = contestByID.get(contestId);
      if (contest?.startTimeSeconds && contest.durationSeconds) {
        const end = contest.startTimeSeconds + contest.durationSeconds;
        if (ts > end) {
          totalUpsolves += 1;
          upsolveByContestMap.set(
            contest.name,
            (upsolveByContestMap.get(contest.name) ?? 0) + 1,
          );
        }
      }
    }

    const ratingValue = problem.rating;
    if (typeof ratingValue === "number") {
      solvedWithRating += 1;
      solvedRatingSum += ratingValue;
      highestSolvedRating = Math.max(highestSolvedRating, ratingValue);

      if (ratingValue < 1100) difficultyBands["<1100"] += 1;
      else if (ratingValue < 1400) difficultyBands["1100-1399"] += 1;
      else if (ratingValue < 1700) difficultyBands["1400-1699"] += 1;
      else if (ratingValue < 2000) difficultyBands["1700-1999"] += 1;
      else difficultyBands["2000+"] += 1;

      const mKey = monthKey(ts);
      const current = solvedRatingByMonthMap.get(mKey) ?? {
        total: 0,
        count: 0,
        max: 0,
      };
      current.total += ratingValue;
      current.count += 1;
      current.max = Math.max(current.max, ratingValue);
      solvedRatingByMonthMap.set(mKey, current);

      const currentRating = user.rating ?? 0;
      if (ratingValue > currentRating) {
        aboveRatedSolved += 1;
        aboveRatedGapSum += ratingValue - currentRating;
      }
    }
  }

  const solvedPerMonth = [...solvedPerMonthMap.entries()]
    .map(([month, count]) => ({ month, solved: count }))
    .sort((a, b) => a.month.localeCompare(b.month));

  const sortedSolvedDays = [...solvedDaySet.values()].sort();
  let currentStreak = 0;
  let bestStreak = 0;
  let prev: Date | null = null;
  for (const day of sortedSolvedDays) {
    const dayDate = new Date(`${day}T00:00:00Z`);
    if (!prev) {
      currentStreak = 1;
    } else {
      const gap = (dayDate.getTime() - prev.getTime()) / 86400000;
      currentStreak = gap === 1 ? currentStreak + 1 : 1;
    }
    if (currentStreak > bestStreak) bestStreak = currentStreak;
    prev = dayDate;
  }

  const difficultyDistribution = Object.entries(difficultyBands).map(
    ([band, count]) => ({
      band,
      count,
      percentage: solvedCount > 0 ? (count / solvedCount) * 100 : 0,
    }),
  );

  const difficultyProgression = [...solvedRatingByMonthMap.entries()]
    .map(([month, value]) => ({
      month,
      avgRating: value.count ? value.total / value.count : 0,
      maxRating: value.max,
    }))
    .sort((a, b) => a.month.localeCompare(b.month));

  const upsolveByContest = [...upsolveByContestMap.entries()]
    .map(([contest, upsolves]) => ({ contest, upsolves }))
    .sort((a, b) => b.upsolves - a.upsolves)
    .slice(0, 20);

  const topTags = [...tagFrequencyMap.entries()]
    .map(([tag, solvedTagCount]) => ({ tag, solved: solvedTagCount }))
    .sort((a, b) => b.solved - a.solved)
    .slice(0, 10);

  const leastTags = [...tagFrequencyMap.entries()]
    .map(([tag, solvedTagCount]) => ({ tag, solved: solvedTagCount }))
    .sort((a, b) => b.solved - a.solved)
    .slice(0, 10);

  const radarTags = [...tagFrequencyMap.entries()]
    .map(([tag, solvedTagCount]) => ({ tag, solved: solvedTagCount }))
    .sort((a, b) => b.solved - a.solved)
    .slice(0, 6);

  const accepted = verdictCountsMap.get("OK") ?? 0;
  const totalSubmissions = submissions.length;
  const successRate =
    totalSubmissions > 0 ? (accepted / totalSubmissions) * 100 : 0;

  let totalAttemptsOnSolved = 0;
  for (const key of solvedMap.keys()) {
    totalAttemptsOnSolved += attemptsMap.get(key) ?? 0;
  }
  const avgAttemptsPerSolved =
    solvedCount > 0 ? totalAttemptsOnSolved / solvedCount : 0;

  const currentRating = user.rating ?? 0;
  const aboveRatedPct =
    solvedCount > 0 ? (aboveRatedSolved / solvedCount) * 100 : 0;
  const belowRatedSolved = solvedCount - aboveRatedSolved;
  const avgRatingGap =
    aboveRatedSolved > 0 ? aboveRatedGapSum / aboveRatedSolved : 0;

  const registrationDate = toDate(user.registrationTimeSeconds);

  return {
    basic: {
      handle: user.handle,
      currentRating: user.rating ?? null,
      maxRating: user.maxRating ?? null,
      rank: user.rank ?? null,
      contribution: user.contribution,
      organization: user.organization ?? null,
      registrationDate: registrationDate.toISOString(),
      ratingDeltaFromMax: (user.maxRating ?? 0) - (user.rating ?? 0),
      totalContests: ratingSorted.length,
      totalSolved: solvedCount,
    },
    rating: {
      trend: ratingTrend,
      changes: ratingChangeBars,
      max: ratingStats.max,
      min: ratingStats.min,
      avgChange: ratingStats.avgDelta,
      largestIncrease: ratingStats.largestIncrease,
      largestDecrease: ratingStats.largestDecrease,
      volatility: ratingStats.volatility,
    },
    contest: contestParticipation,
    problemVolume: {
      solvedPerMonth,
      solveStreak: bestStreak,
      avgSolvesPerContest:
        ratingSorted.length > 0 ? solvedCount / ratingSorted.length : 0,
      totalUniqueSolved: solvedCount,
    },
    difficulty: {
      distribution: difficultyDistribution,
      highestSolvedRating,
      avgSolvedRating:
        solvedWithRating > 0 ? solvedRatingSum / solvedWithRating : 0,
    },
    difficultyProgression,
    upsolve: {
      totalUpsolves,
      upsolveRatio: solvedCount > 0 ? totalUpsolves / solvedCount : 0,
      upsolvesPerContest:
        ratingSorted.length > 0 ? totalUpsolves / ratingSorted.length : 0,
      byContest: upsolveByContest,
    },
    tags: {
      uniqueTags: tagFrequencyMap.size,
      topTags,
      leastTags,
      radarTags,
    },
    submissions: {
      total: totalSubmissions,
      accepted,
      successRate,
      avgAttemptsPerSolved,
      verdictBreakdown,
      languageUsage,
      monthlySuccessRate,
    },
    aboveRated: {
      aboveCount: aboveRatedSolved,
      belowCount: belowRatedSolved,
      abovePct: aboveRatedPct,
      avgGap: avgRatingGap,
    },
  };
}

async function loadAnalytics(handle: string): Promise<AnalyticsViewModel> {
  const [users, rating, submissions, contests] = await Promise.all([
    cfFetch<CFUser[]>(
      `https://codeforces.com/api/user.info?handles=${encodeURIComponent(handle)}`,
    ),
    cfFetch<CFRatingChange[]>(
      `https://codeforces.com/api/user.rating?handle=${encodeURIComponent(handle)}`,
    ),
    cfFetch<CFSubmission[]>(
      `https://codeforces.com/api/user.status?handle=${encodeURIComponent(handle)}&from=1&count=5000`,
    ),
    cfFetch<CFContest[]>("https://codeforces.com/api/contest.list?gym=false"),
  ]);

  const user = users[0];
  if (!user) throw new Error("Codeforces user not found");

  return buildModel(user, rating, submissions, contests);
}

type Props = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export default async function Page(props: Props) {
  const searchParams = await props.searchParams;
  const session = await auth();
  const sessionHandle = session?.user?.name?.trim();
  const queryHandle =
    typeof searchParams.handle === "string" ? searchParams.handle.trim() : null;

  const handle = queryHandle || sessionHandle;
  const isPublicView = !!queryHandle && queryHandle !== sessionHandle;
  const showSignIn = isPublicView && !session;

  if (!handle) {
    return (
      <div className="min-h-screen bg-[#070707] p-6 text-zinc-100">
        <div className="rounded-xl border border-zinc-800 bg-[#171717] p-4 text-sm text-zinc-300">
          No Codeforces handle is locked for this account yet. Sign in from
          landing and complete handle setup first.
        </div>
      </div>
    );
  }

  try {
    const model = await loadAnalytics(handle);
    return (
      <>
        {showSignIn && (
          <header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between border-b border-zinc-800 bg-[#070707]/80 px-6 py-3 backdrop-blur-md">
            <div className="flex items-center gap-2">
              <span className="font-[family-name:var(--font-geist-pixel-square)] text-lg font-bold text-zinc-100">
                cfetch
              </span>
            </div>
            <form
              action={async () => {
                "use server";
                await import("@/auth").then((m) => m.signIn("google"));
              }}
            >
              <button
                type="submit"
                className="flex items-center rounded-md bg-zinc-100 px-3 py-1.5 text-xs font-medium uppercase tracking-wider text-zinc-900 transition hover:bg-white"
              >
                <img
                  src="https://authjs.dev/img/providers/google.svg"
                  alt="Google"
                  className="mr-2 h-3 w-3"
                />
                Sign In
              </button>
            </form>
          </header>
        )}
        <div className={showSignIn ? "pt-16" : ""}>
          <AnalyticsDashboard data={model} />
        </div>
        {showSignIn && (
          <div className="mx-auto w-full max-w-3xl px-4 py-32">
            <div className="relative overflow-hidden rounded-3xl border border-zinc-800 bg-gradient-to-b from-zinc-900/50 to-[#171717] p-8 text-center shadow-2xl shadow-zinc-950 transition-colors hover:border-zinc-700 sm:p-12">
              <div className="pointer-events-none absolute inset-0 bg-[repeating-linear-gradient(-45deg,rgba(255,255,255,0.02)_0px,rgba(255,255,255,0.02)_1px,transparent_1px,transparent_7px)]" />
              <div className="relative flex flex-col items-center gap-6">
                <h2 className="font-[family-name:var(--font-geist-pixel-square)] text-2xl text-zinc-100 sm:text-3xl">
                  Ready to enter the arena?
                </h2>
                <p className="max-w-lg text-base text-zinc-400">
                  Viewing public analytics for{" "}
                  <span className="font-medium text-zinc-200">{handle}</span>.
                  Sign in to challenge others in a 1v1 duel, track your own
                  progress, and climb the ranks.
                </p>
                <form
                  action={async () => {
                    "use server";
                    await import("@/auth").then((m) => m.signIn("google"));
                  }}
                >
                  <button
                    type="submit"
                    className="flex items-center rounded-md bg-zinc-100 px-5 py-2.5 text-sm font-medium text-zinc-900 transition hover:bg-white hover:shadow-[0_0_20px_-5px_rgba(255,255,255,0.3)]"
                  >
                    <img
                      src="https://authjs.dev/img/providers/google.svg"
                      alt="Google"
                      className="mr-2 h-4 w-4"
                    />
                    Sign in with Google
                  </button>
                </form>
              </div>
            </div>
          </div>
        )}
      </>
    );
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to load analytics";
    return (
      <div className="min-h-screen bg-[#070707] p-6 text-zinc-100">
        <div className="rounded-xl border border-red-900/40 bg-red-950/30 p-4 text-sm text-red-200">
          Failed to load analytics for{" "}
          <span className="font-semibold">{handle}</span>: {message}
        </div>
      </div>
    );
  }
}
