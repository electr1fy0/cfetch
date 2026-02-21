import { NextRequest, NextResponse } from "next/server";

const handlePattern = /^[a-zA-Z0-9_\-.]{3,24}$/;

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
  contribution: number;
  friendOfCount: number;
};

type CFRatingChange = { contestId: number };

type CFSubmission = {
  verdict?: string;
  problem?: {
    contestId?: number;
    index?: string;
    name?: string;
  };
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
    throw new Error(`Codeforces request failed with status ${res.status}`);
  }
  const json = (await res.json()) as CFResponse<T>;
  if (json.status !== "OK") throw new Error(json.comment ?? "Codeforces API error");
  return json.result;
}

export async function GET(request: NextRequest) {
  const handle = request.nextUrl.searchParams.get("handle")?.trim() ?? "";

  if (!handlePattern.test(handle)) {
    return NextResponse.json({ error: "Invalid handle format" }, { status: 400 });
  }

  try {
    const [users, rating, submissions] = await Promise.all([
      cfFetch<CFUser[]>(`https://codeforces.com/api/user.info?handles=${encodeURIComponent(handle)}`),
      cfFetch<CFRatingChange[]>(`https://codeforces.com/api/user.rating?handle=${encodeURIComponent(handle)}`),
      cfFetch<CFSubmission[]>(`https://codeforces.com/api/user.status?handle=${encodeURIComponent(handle)}&from=1&count=100`),
    ]);

    const user = users[0];
    if (!user) {
      return NextResponse.json({ error: "Codeforces account not found" }, { status: 404 });
    }

    const accepted = submissions.filter((s) => s.verdict === "OK");
    const solvedSet = new Set(
      accepted
        .map((s) => s.problem)
        .filter((p): p is NonNullable<CFSubmission["problem"]> => Boolean(p))
        .map((p) => `${p.contestId ?? ""}-${p.index ?? ""}-${p.name ?? ""}`),
    );

    const acceptanceRate = submissions.length === 0 ? 0 : (accepted.length / submissions.length) * 100;

    return NextResponse.json({
      handle: user.handle,
      rating: user.rating ?? null,
      maxRating: user.maxRating ?? null,
      rank: user.rank ?? null,
      maxRank: user.maxRank ?? null,
      contests: rating.length,
      solvedCount: solvedSet.size,
      acceptanceRate,
      recentAccepted: accepted.length,
      contribution: user.contribution,
      friendOfCount: user.friendOfCount,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to load Codeforces analytics";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
