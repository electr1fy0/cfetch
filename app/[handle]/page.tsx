import Link from "next/link";
import type { ReactNode } from "react";
import { AnalyticsDashboard } from "@/components/analytics-dashboard";
import { GitHubBadge } from "@/components/github-badge";
import HandleInput from "@/components/handle-input";
import { loadAnalytics } from "@/lib/codeforces";

type Props = {
  params: Promise<{ handle: string }>;
};

function formatErrorMessage(error: unknown, handle: string): ReactNode {
  const fallback = "Failed to load analytics. Please try again.";
  if (!(error instanceof Error)) return fallback;
  const message = error.message.toLowerCase();

  if (
    message.includes("400") ||
    message.includes("404") ||
    message.includes("not found") ||
    message.includes("user with handle")
  ) {
    return (
      <>
        The handle{" "}
        <code className="rounded bg-zinc-900 px-1 py-0.5 font-mono text-zinc-200">
          {handle}
        </code>{" "}
        does not exist on Codeforces.
      </>
    );
  }

  return error.message;
}

export default async function HandlePage({ params }: Props) {
  const { handle } = await params;
  const queryHandle = decodeURIComponent(handle).trim();

  if (!queryHandle) {
    return (
      <div className="min-h-screen bg-[#070707] bg-[repeating-linear-gradient(-45deg,rgba(255,255,255,0.07)_0px,rgba(255,255,255,0.07)_1px,transparent_1px,transparent_7px)] flex flex-col items-center justify-center p-6 text-zinc-100">
        <div className="w-full max-w-md space-y-6">
          <div className="bg-[#111] p-6 border border-zinc-800 shadow-[4px_4px_0px_0px_rgba(39,39,42,0.5)] text-center space-y-2">
            <p className="font-[family-name:var(--font-geist-pixel-square)] text-xl text-zinc-100">
              Invalid Handle
            </p>
            <p className="text-sm text-zinc-400">
              Enter a valid Codeforces handle to continue.
            </p>
          </div>
          <HandleInput />
          <div className="text-center">
            <Link href="/" className="text-sm text-zinc-500 hover:text-zinc-300 transition-colors">
              &larr; Back to Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  try {
    const model = await loadAnalytics(queryHandle);
    return (
      <>
        <AnalyticsDashboard data={model} />
        <div className="relative z-20 bg-[#070707] bg-[repeating-linear-gradient(-45deg,rgba(255,255,255,0.07)_0px,rgba(255,255,255,0.07)_1px,transparent_1px,transparent_7px)] px-4 pb-8 sm:px-6 lg:px-8">
          <div className="mx-auto w-full max-w-3xl">
            <div className="mb-4 border border-zinc-800 bg-[#111] p-5 shadow-[4px_4px_0px_0px_rgba(39,39,42,0.5)]">
              <p className="font-[family-name:var(--font-geist-pixel-square)] text-sm uppercase tracking-[0.18em] text-zinc-200">
                Analyze Another Handle
              </p>
              <p className="mt-2 text-sm text-zinc-300">
                Check another profile.
              </p>
              <div className="mt-4">
                <HandleInput className="mx-0 max-w-none" autoFocus={false} />
              </div>
            </div>
            <GitHubBadge variant="card" />
          </div>
        </div>
      </>
    );
  } catch (error) {
    return (
      <div className="min-h-screen bg-[#070707] bg-[repeating-linear-gradient(-45deg,rgba(255,255,255,0.07)_0px,rgba(255,255,255,0.07)_1px,transparent_1px,transparent_7px)] flex flex-col items-center justify-center p-6 text-zinc-100">
        <div className="w-full max-w-md space-y-6">
          <div className="bg-[#111] p-6 border border-zinc-800 shadow-[4px_4px_0px_0px_rgba(39,39,42,0.5)] text-center space-y-2">
            <p className="font-[family-name:var(--font-geist-pixel-square)] text-xl text-zinc-100">
              Couldn&apos;t load this profile
            </p>
            <p className="text-sm text-zinc-400">{formatErrorMessage(error, queryHandle)}</p>
          </div>

          <div className="bg-[#111] p-6 border border-zinc-800 shadow-[4px_4px_0px_0px_rgba(39,39,42,0.5)]">
            <h2 className="text-lg font-medium text-center mb-4 text-zinc-300">Try another handle</h2>
            <HandleInput initialValue={queryHandle} />
          </div>

          <div className="text-center">
            <Link href="/" className="text-sm text-zinc-500 hover:text-zinc-300 transition-colors">
              &larr; Back to Home
            </Link>
          </div>
        </div>
      </div>
    );
  }
}
