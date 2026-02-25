import Link from "next/link";
import { Github, Star } from "lucide-react";

const REPO_OWNER = "electr1fy0";
const REPO_NAME = "cfetch";
const REPO_URL = `https://github.com/${REPO_OWNER}/${REPO_NAME}`;

type RepoResponse = {
  stargazers_count?: number;
};

type GitHubBadgeProps = {
  variant?: "inline" | "card";
};

function formatStars(count: number): string {
  if (count >= 1_000_000) return `${(count / 1_000_000).toFixed(1)}m`;
  if (count >= 1_000) return `${(count / 1_000).toFixed(1)}k`;
  return String(count);
}

async function getStars(): Promise<number | null> {
  try {
    const response = await fetch(
      `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}`,
      {
        next: { revalidate: 3600 },
        headers: {
          Accept: "application/vnd.github+json",
          "User-Agent": "cfetch-web",
        },
      },
    );

    if (!response.ok) return null;

    const data = (await response.json()) as RepoResponse;
    return typeof data.stargazers_count === "number"
      ? data.stargazers_count
      : null;
  } catch {
    return null;
  }
}

export async function GitHubBadge({ variant = "inline" }: GitHubBadgeProps) {
  const stars = await getStars();

  if (variant === "card") {
    return (
      <div className="relative isolate z-20 w-full overflow-hidden border border-zinc-800 bg-[#111] p-5 shadow-[4px_4px_0px_0px_rgba(39,39,42,0.5)]">
        <div className="absolute inset-0 -z-10 bg-[#111]" />
        <div className="flex flex-col items-center gap-3 text-center sm:flex-row sm:justify-between sm:text-left">
          <div>
            <p className="font-[family-name:var(--font-geist-pixel-square)] text-sm uppercase tracking-[0.18em] text-zinc-200">
              Support cfetch
            </p>
            <p className="mt-1 text-sm text-zinc-400">If this helps, drop a star on GitHub.</p>
          </div>
          <Link
            href={REPO_URL}
            target="_blank"
            rel="noreferrer noopener"
            className="inline-flex items-center gap-2 border border-zinc-700 bg-zinc-900 px-3 py-2 text-[10px] uppercase tracking-[0.18em] text-zinc-200 transition-colors hover:border-zinc-500 hover:text-white font-[family-name:var(--font-geist-pixel-square)]"
            aria-label="Open GitHub repository"
          >
            <Github className="h-3.5 w-3.5" />
            Star on GitHub
            {stars !== null && (
              <span className="ml-1 inline-flex items-center gap-1 border border-zinc-700 bg-[#111] px-1.5 py-0.5 text-[9px] text-zinc-200">
                <Star className="h-3 w-3 fill-current" />
                {formatStars(stars)}
              </span>
            )}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <Link
      href={REPO_URL}
      target="_blank"
      rel="noreferrer noopener"
      className="inline-flex items-center gap-2 border border-zinc-800 bg-[#111] px-3 py-2 text-[10px] uppercase tracking-[0.18em] text-zinc-300 shadow-[4px_4px_0px_0px_rgba(39,39,42,0.5)] transition-colors hover:border-zinc-600 hover:text-white font-[family-name:var(--font-geist-pixel-square)]"
      aria-label="Open GitHub repository"
    >
      <Github className="h-3.5 w-3.5" />
      <span>GitHub</span>
      {stars !== null && (
        <span className="ml-1 inline-flex items-center gap-1 border border-zinc-700 bg-zinc-900/70 px-1.5 py-0.5 text-[9px] text-zinc-200">
          <Star className="h-3 w-3 fill-current" />
          {formatStars(stars)}
        </span>
      )}
    </Link>
  );
}
