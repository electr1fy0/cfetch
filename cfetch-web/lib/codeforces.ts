import { AnalyticsViewModel } from "@/components/analytics-dashboard";

export type CFResponse<T> = {
  status: "OK" | "FAILED";
  comment?: string;
  result: T;
};

export type CFUser = {
  handle: string;
  rating?: number;
  maxRating?: number;
  rank?: string;
  contribution: number;
  organization?: string;
  registrationTimeSeconds: number;
};

export type CFRatingChange = {
  contestId: number;
  contestName: string;
  rank: number;
  newRating: number;
  oldRating: number;
  ratingUpdateTimeSeconds: number;
};

export type CFProblem = {
  contestId?: number;
  index?: string;
  name?: string;
  rating?: number;
  tags?: string[];
};

export type CFSubmission = {
  creationTimeSeconds: number;
  verdict?: string;
  programmingLanguage?: string;
  problem?: CFProblem;
};

export type CFContest = {
  id: number;
  name: string;
  startTimeSeconds?: number;
  durationSeconds?: number;
  relativeTimeSeconds: number;
};

export function toDate(tsSeconds: number): Date {
  return new Date(tsSeconds * 1000);
}

export function monthKey(tsSeconds: number): string {
  const date = toDate(tsSeconds);
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}`;
}

export function dayKey(tsSeconds: number): string {
  const date = toDate(tsSeconds);
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}-${String(date.getUTCDate()).padStart(2, "0")}`;
}

export async function cfFetch<T>(url: string): Promise<T> {
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

export function standardDeviation(values: number[]): number {
  if (values.length === 0) return 0;
  const mean = values.reduce((sum, v) => sum + v, 0) / values.length;
  const variance =
    values.reduce((sum, v) => sum + (v - mean) ** 2, 0) / values.length;
  return Math.sqrt(variance);
}

export function buildModel(
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
    .sort((a, b) => a.solved - b.solved)
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

export async function loadAnalytics(handle: string): Promise<AnalyticsViewModel> {
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