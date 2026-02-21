import { auth } from "@/auth";
import { AnalyticsDashboard, type AnalyticsViewModel } from "@/components/analytics-dashboard";

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
  maxRank?: string;
};

type CFRatingChange = {
  contestId: number;
  contestName: string;
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
  problem?: CFProblem;
};

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

function buildModel(user: CFUser, rating: CFRatingChange[], submissions: CFSubmission[]): AnalyticsViewModel {
  const ratingTrend = rating.map((row) => ({
    label: row.contestName,
    rating: row.newRating,
    delta: row.newRating - row.oldRating,
    at: new Date(row.ratingUpdateTimeSeconds * 1000).toLocaleDateString(),
  }));

  const verdictMap = new Map<string, number>();
  for (const submission of submissions) {
    const verdict = submission.verdict ?? "UNKNOWN";
    verdictMap.set(verdict, (verdictMap.get(verdict) ?? 0) + 1);
  }

  const verdictBreakdown = [...verdictMap.entries()]
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 8);

  const tagMap = new Map<string, number>();
  const solvedKeys = new Set<string>();
  for (const submission of submissions) {
    if (submission.verdict !== "OK") continue;
    const problem = submission.problem;
    if (!problem) continue;

    const key = `${problem.contestId ?? ""}-${problem.index ?? ""}-${problem.name ?? ""}`;
    if (solvedKeys.has(key)) continue;
    solvedKeys.add(key);

    for (const tag of problem.tags ?? []) {
      tagMap.set(tag, (tagMap.get(tag) ?? 0) + 1);
    }
  }

  const topTags = [...tagMap.entries()]
    .map(([tag, solved]) => ({ tag, solved }))
    .sort((a, b) => b.solved - a.solved)
    .slice(0, 10);

  const hourMap = new Array<number>(24).fill(0);
  for (const submission of submissions) {
    const hour = new Date(submission.creationTimeSeconds * 1000).getHours();
    hourMap[hour] += 1;
  }

  const activityByHour = hourMap.map((count, hour) => ({
    hour: `${hour.toString().padStart(2, "0")}:00`,
    submissions: count,
  }));

  const ratingBuckets: Record<string, number> = {
    "<1200": 0,
    "1200-1399": 0,
    "1400-1599": 0,
    "1600-1899": 0,
    "1900+": 0,
    Unknown: 0,
  };

  for (const submission of submissions) {
    const problemRating = submission.problem?.rating;
    if (typeof problemRating !== "number") {
      ratingBuckets.Unknown += 1;
      continue;
    }

    if (problemRating < 1200) ratingBuckets["<1200"] += 1;
    else if (problemRating < 1400) ratingBuckets["1200-1399"] += 1;
    else if (problemRating < 1600) ratingBuckets["1400-1599"] += 1;
    else if (problemRating < 1900) ratingBuckets["1600-1899"] += 1;
    else ratingBuckets["1900+"] += 1;
  }

  const problemRatingMix = Object.entries(ratingBuckets).map(([bucket, attempts]) => ({
    bucket,
    attempts,
  }));

  const accepted = submissions.filter((row) => row.verdict === "OK").length;
  const acceptanceRate = submissions.length === 0 ? 0 : (accepted / submissions.length) * 100;

  return {
    handle: user.handle,
    currentRating: user.rating ?? null,
    maxRating: user.maxRating ?? null,
    rank: user.rank ?? null,
    maxRank: user.maxRank ?? null,
    contests: rating.length,
    accepted,
    submissions: submissions.length,
    uniqueSolved: solvedKeys.size,
    acceptanceRate,
    ratingTrend,
    verdictBreakdown,
    topTags,
    activityByHour,
    problemRatingMix,
  };
}

async function loadAnalytics(handle: string): Promise<AnalyticsViewModel> {
  const [users, rating, submissions] = await Promise.all([
    cfFetch<CFUser[]>(`https://codeforces.com/api/user.info?handles=${encodeURIComponent(handle)}`),
    cfFetch<CFRatingChange[]>(`https://codeforces.com/api/user.rating?handle=${encodeURIComponent(handle)}`),
    cfFetch<CFSubmission[]>(`https://codeforces.com/api/user.status?handle=${encodeURIComponent(handle)}&from=1&count=300`),
  ]);

  const user = users[0];
  if (!user) throw new Error("Codeforces user not found");

  return buildModel(user, rating, submissions);
}

export default async function Page() {
  const session = await auth();
  const handle = session?.user?.name?.trim();

  if (!handle) {
    return (
      <div className="min-h-screen bg-stone-950 p-6 text-stone-100">
        <div className="rounded-xl border border-stone-800 bg-stone-900/70 p-4 text-sm text-stone-300">
          No Codeforces handle is locked for this account yet. Sign in from landing and complete handle setup first.
        </div>
      </div>
    );
  }

  try {
    const model = await loadAnalytics(handle);
    return <AnalyticsDashboard data={model} />;
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to load analytics";
    return (
      <div className="min-h-screen bg-stone-950 p-6 text-stone-100">
        <div className="rounded-xl border border-red-900/40 bg-red-950/30 p-4 text-sm text-red-200">
          Failed to load analytics for <span className="font-semibold">{handle}</span>: {message}
        </div>
      </div>
    );
  }
}
