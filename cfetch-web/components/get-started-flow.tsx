"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

type AnalyticsResponse = {
  handle: string;
  rating: number | null;
  maxRating: number | null;
  rank: string | null;
  maxRank: string | null;
  contests: number;
  solvedCount: number;
  acceptanceRate: number;
  recentAccepted: number;
  contribution: number;
  friendOfCount: number;
};

const handlePattern = /^[a-zA-Z0-9_\-.]{3,24}$/;

export function GetStartedFlow({
  startWithGoogle,
}: {
  startWithGoogle: (formData: FormData) => Promise<void>;
}) {
  const [handle, setHandle] = useState("");
  const [data, setData] = useState<AnalyticsResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleIsValid = useMemo(() => handlePattern.test(handle), [handle]);

  async function lookup() {
    if (!handleIsValid) {
      setError("Enter a valid Codeforces handle.");
      return;
    }

    setLoading(true);
    setError(null);
    setData(null);

    try {
      const res = await fetch(
        `/api/codeforces/analytics?handle=${encodeURIComponent(handle)}`,
      );

      if (!res.ok) {
        const payload = (await res.json().catch(() => null)) as
          | { error?: string }
          | null;
        throw new Error(payload?.error ?? "Failed to fetch Codeforces data");
      }

      const payload = (await res.json()) as AnalyticsResponse;
      setData(payload);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unexpected error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex w-full max-w-2xl flex-col gap-2 sm:flex-row">
        <input
          value={handle}
          onChange={(e) => setHandle(e.target.value.trim())}
          aria-label="Codeforces handle"
          placeholder="Enter Codeforces handle"
          className="h-11 flex-1 rounded-md border border-dashed border-zinc-600 bg-zinc-950 px-4 text-sm text-zinc-200 placeholder:text-zinc-500"
        />
        <Button
          type="button"
          onClick={lookup}
          disabled={loading || !handleIsValid}
          className="h-11 rounded-md border border-zinc-500 bg-zinc-100 px-4 text-xs uppercase tracking-[0.2em] text-zinc-900 transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? "Checking..." : "Get Started"}
        </Button>
      </div>

      {error ? <p className="text-sm text-red-300">{error}</p> : null}

      {data ? (
        <div className="space-y-4">
          <form action={startWithGoogle}>
            <input type="hidden" name="handle" value={data.handle} readOnly />
            <Button
              type="submit"
              className="h-11 rounded-md border border-zinc-500 bg-zinc-100 px-4 text-xs uppercase tracking-[0.2em] text-zinc-900 transition hover:bg-white"
            >
              Sign in with Google
            </Button>
          </form>

          <div className="grid gap-2 sm:grid-cols-2">
            <Card className="rounded border-dashed border-zinc-700 bg-zinc-950/70">
              <CardContent className="px-3 py-2">
                <p className="text-xs uppercase tracking-[0.16em] text-zinc-500">rating</p>
                <p className="text-sm text-zinc-200">{data.rating ?? "Unrated"}</p>
              </CardContent>
            </Card>
            <Card className="rounded border-dashed border-zinc-700 bg-zinc-950/70">
              <CardContent className="px-3 py-2">
                <p className="text-xs uppercase tracking-[0.16em] text-zinc-500">max rating</p>
                <p className="text-sm text-zinc-200">{data.maxRating ?? "Unrated"}</p>
              </CardContent>
            </Card>
            <Card className="rounded border-dashed border-zinc-700 bg-zinc-950/70">
              <CardContent className="px-3 py-2">
                <p className="text-xs uppercase tracking-[0.16em] text-zinc-500">rank</p>
                <p className="text-sm text-zinc-200">{data.rank ?? "-"}</p>
              </CardContent>
            </Card>
            <Card className="rounded border-dashed border-zinc-700 bg-zinc-950/70">
              <CardContent className="px-3 py-2">
                <p className="text-xs uppercase tracking-[0.16em] text-zinc-500">max rank</p>
                <p className="text-sm text-zinc-200">{data.maxRank ?? "-"}</p>
              </CardContent>
            </Card>
            <Card className="rounded border-dashed border-zinc-700 bg-zinc-950/70">
              <CardContent className="px-3 py-2">
                <p className="text-xs uppercase tracking-[0.16em] text-zinc-500">contests</p>
                <p className="text-sm text-zinc-200">{data.contests}</p>
              </CardContent>
            </Card>
            <Card className="rounded border-dashed border-zinc-700 bg-zinc-950/70">
              <CardContent className="px-3 py-2">
                <p className="text-xs uppercase tracking-[0.16em] text-zinc-500">accepted rate</p>
                <p className="text-sm text-zinc-200">{data.acceptanceRate.toFixed(1)}%</p>
              </CardContent>
            </Card>
            <Card className="rounded border-dashed border-zinc-700 bg-zinc-950/70">
              <CardContent className="px-3 py-2">
                <p className="text-xs uppercase tracking-[0.16em] text-zinc-500">recent accepted (100)</p>
                <p className="text-sm text-zinc-200">{data.recentAccepted}</p>
              </CardContent>
            </Card>
            <Card className="rounded border-dashed border-zinc-700 bg-zinc-950/70">
              <CardContent className="px-3 py-2">
                <p className="text-xs uppercase tracking-[0.16em] text-zinc-500">total solved</p>
                <p className="text-sm text-zinc-200">{data.solvedCount}</p>
              </CardContent>
            </Card>
          </div>

          <form action={startWithGoogle}>
            <input type="hidden" name="handle" value={data.handle} readOnly />
            <Button
              type="submit"
              className="h-11 rounded-md border border-zinc-500 bg-zinc-100 px-4 text-xs uppercase tracking-[0.2em] text-zinc-900 transition hover:bg-white"
            >
              Sign in with Google
            </Button>
          </form>
        </div>
      ) : null}
    </div>
  );
}
