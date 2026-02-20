import Link from "next/link";
import { signIn } from "@/auth";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Clock01Icon,
  CodeIcon,
  KeyboardIcon,
  SearchIcon,
  ViewIcon,
} from "@hugeicons/core-free-icons";

const marqueeFeed = [
  "state-syncing duel telemetry",
  "vectorized cf metadata index",
  "delta prediction model online",
  "anti-slump filter active",
  "sandbox latency within target",
  "snippet vault version graph",
];

const analyticsRows = [
  {
    metric: "#dp confidence",
    detail: "1600: stable solve velocity",
    state: "ok",
  },
  {
    metric: "#dp confidence",
    detail: "1800: repeated WA on transitions",
    state: "risk",
  },
  {
    metric: "delta prediction",
    detail: "+47 if duel close-rate holds 72h",
    state: "up",
  },
  {
    metric: "logic bottleneck",
    detail: "state compression + proof validation",
    state: "risk",
  },
];

const duelSignals = [
  "Elo pairing with narrow variance windows",
  "Live opponent test-case ping stream",
  "State-synced timer, verdicts, and fail traces",
];

const discoverySignals = [
  "Sub-second tag/rating/solve-count filtering",
  "Anti-Slump hides solved and seen CF tasks",
  "Heuristics surface problems near your failure boundary",
];

const snippetSignals = [
  "Quick-inject hotkeys from in-editor modal",
  "Fork optimized templates: HLD, FFT, MaxFlow",
  "Version-controlled notebook with rollback",
];

function SignInAction() {
  return (
    <form
      action={async () => {
        "use server";
        await signIn("google");
      }}
      className="flex w-full max-w-xl flex-col gap-2 sm:flex-row"
    >
      <input
        aria-label="Codeforces handle"
        placeholder="Enter Codeforces username"
        className="h-11 flex-1 rounded-md border border-dashed border-zinc-600 bg-zinc-950 px-4 text-sm text-zinc-200 placeholder:text-zinc-500"
      />
      <Button
        type="submit"
        className="h-11 rounded-md border border-zinc-500 bg-zinc-100 px-4 text-xs uppercase tracking-[0.2em] text-zinc-900 transition hover:bg-white"
      >
        Get Started
      </Button>
    </form>
  );
}

function SectionBlock({
  index,
  title,
  body,
  points,
  variant = "split",
}: {
  index: string;
  title: string;
  body: string;
  points: string[];
  variant?: "split" | "stack" | "rail";
}) {
  const layoutClass =
    variant === "stack"
      ? "relative grid h-full content-center gap-10"
      : variant === "rail"
        ? "relative grid h-full content-center gap-10 lg:grid-cols-[0.8fr_1.2fr]"
        : "relative grid h-full content-center gap-10 lg:grid-cols-[1.05fr_0.95fr]";

  const pointsClass =
    variant === "stack"
      ? "grid gap-4 sm:grid-cols-2"
      : variant === "rail"
        ? "space-y-4 border-t border-dashed border-zinc-700 pt-6 lg:border-l lg:border-t-0 lg:pl-8 lg:pt-0"
        : "space-y-4 border-t border-dashed border-zinc-700 pt-6 lg:border-l lg:border-t-0 lg:pl-8 lg:pt-0";

  return (
    <section className="relative overflow-hidden rounded-2xl border border-dashed border-zinc-700/80 bg-zinc-950/60 p-7 sm:p-10 lg:min-h-[88vh] lg:p-14">
      <div className="pointer-events-none absolute inset-0 bg-[repeating-linear-gradient(-45deg,rgba(255,255,255,0.02)_0px,rgba(255,255,255,0.02)_1px,transparent_1px,transparent_7px)]" />
      <div className={layoutClass}>
        <div className="space-y-6">
          <p className="text-[11px] uppercase tracking-[0.22em] text-zinc-500">
            {index}
          </p>
          <h2 className="max-w-2xl text-3xl leading-tight text-zinc-100 sm:text-5xl">
            {title}
          </h2>
          <p className="max-w-xl text-base leading-relaxed text-zinc-300 sm:text-lg">
            {body}
          </p>
        </div>
        <div className={pointsClass}>
          {points.map((point) => (
            <Card
              key={point}
              className="rounded-md border-dashed border-zinc-700 bg-zinc-900/55"
            >
              <CardContent className="px-4 py-4 text-base text-zinc-300">
                {point}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

export default async function Landing() {
  return (
    <div className="min-h-screen bg-[#070707] px-4 py-6 text-zinc-100 sm:px-6 sm:py-8">
      <main className="mx-auto w-full max-w-7xl space-y-6 font-[family-name:var(--font-geist-mono)] sm:space-y-8">
        <section className="relative overflow-hidden rounded-3xl border border-zinc-700/70 bg-[#101011] lg:min-h-[92vh]">
          <div className="pointer-events-none absolute inset-0 bg-[repeating-linear-gradient(-45deg,rgba(255,255,255,0.02)_0px,rgba(255,255,255,0.02)_1px,transparent_1px,transparent_7px)]" />
          <div className="pointer-events-none absolute inset-x-6 top-20 border-t border-dashed border-zinc-700/70" />
          <div className="pointer-events-none absolute inset-x-6 bottom-24 border-t border-dashed border-zinc-700/70" />

          <header className="relative flex items-center justify-between gap-3 border-b border-dashed border-zinc-700/70 px-4 py-3 sm:px-6">
            <p className="text-xs uppercase tracking-[0.24em] text-zinc-400">
              Cfetch
            </p>
            <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] text-zinc-500 sm:text-xs">
              <Badge className="rounded-sm border border-dashed border-zinc-700 bg-zinc-900/70 px-2 py-1 text-[10px] font-normal text-zinc-400">
                Codeforces Analytics
              </Badge>
              <Badge className="rounded-sm border border-dashed border-zinc-700 bg-zinc-900/70 px-2 py-1 text-[10px] font-normal text-zinc-400">
                1v1 Arena
              </Badge>
            </div>
          </header>

          <div className="relative grid gap-8 p-5 sm:p-7 lg:grid-cols-[1.1fr_0.9fr] lg:gap-10 lg:p-10">
            <div className="space-y-6">
              <p className="text-xs uppercase tracking-[0.24em] text-zinc-400">
                Hero / Command Center
              </p>
              <h1 className="font-[family-name:var(--font-geist-pixel-triangle)] text-4xl leading-[1.04] text-zinc-50 sm:text-6xl">
                The command center for ranked climbing.
              </h1>
              <p className="max-w-2xl text-base leading-relaxed text-zinc-300 sm:text-lg">
                Cfetch fuses Codeforces discovery, real-time 1v1 duels, and
                logic-level performance analytics into one state-synced
                workspace built for ICPC athletes and serious CF grinders.
              </p>
              <SignInAction />
            </div>

            <Card className="rounded-2xl border-dashed border-zinc-700 bg-zinc-900/55 p-0">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-[11px] uppercase tracking-[0.22em] text-zinc-500">
                    Analytics Snapshot
                  </CardTitle>
                  <HugeiconsIcon
                    icon={SearchIcon}
                    size={16}
                    className="text-[#ff4f00] transition-transform duration-300 group-hover:scale-110"
                    strokeWidth={1.8}
                  />
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-zinc-300">
                Stop guessing why your rating is stagnant. Let the data show
                the bottleneck in your logic.
                </p>
                <div className="mt-4 space-y-2">
                {analyticsRows.slice(0, 2).map((row) => (
                  <Card
                    key={`${row.metric}-${row.detail}`}
                    className="rounded border-dashed border-zinc-700 bg-zinc-950/70"
                  >
                    <CardContent className="flex items-start justify-between gap-4 px-3 py-2">
                      <div>
                      <p className="text-xs uppercase tracking-[0.16em] text-zinc-500">
                        {row.metric}
                      </p>
                      <p className="text-sm text-zinc-300">{row.detail}</p>
                      </div>
                      <span
                        className={`mt-1 inline-block size-2 rounded-full ${
                          row.state === "ok"
                            ? "bg-emerald-300"
                            : row.state === "up"
                              ? "bg-sky-300"
                              : "bg-[#ff4f00] animate-pulse"
                        }`}
                      />
                    </CardContent>
                  </Card>
                ))}
              </div>
              </CardContent>
            </Card>
          </div>

          <div className="relative border-y border-dashed border-zinc-700/70 bg-black/40 py-2">
            <div className="cfetch-marquee-track flex min-w-max gap-6 px-3 text-[11px] uppercase tracking-[0.22em] text-zinc-400 sm:text-xs">
              {[...marqueeFeed, ...marqueeFeed].map((item, idx) => (
                <span key={`${item}-${idx}`} className="flex items-center gap-2">
                  <span className="size-1.5 rounded-full bg-[#ff4f00]" />
                  {item}
                </span>
              ))}
            </div>
          </div>
        </section>

        <section className="relative overflow-hidden rounded-2xl border border-dashed border-zinc-700/80 bg-zinc-950/60 p-7 sm:p-10 lg:min-h-[92vh] lg:p-14">
          <div className="pointer-events-none absolute inset-0 bg-[repeating-linear-gradient(-45deg,rgba(255,255,255,0.02)_0px,rgba(255,255,255,0.02)_1px,transparent_1px,transparent_7px)]" />
          <div className="relative grid h-full content-center gap-10 lg:grid-cols-[1.15fr_0.85fr]">
            <div className="space-y-6">
              <p className="text-[11px] uppercase tracking-[0.22em] text-zinc-500">
                02 / The Arena (Primary)
              </p>
              <h2 className="max-w-3xl text-4xl leading-tight text-zinc-100 sm:text-6xl">
                Duels are the core loop.
              </h2>
              <p className="max-w-2xl text-base leading-relaxed text-zinc-300 sm:text-xl">
                This is the highest-signal feature in Cfetch: isolated 1v1
                rounds under hard timing, live opponent feedback, and Elo
                updates that reflect execution under pressure.
              </p>
              <div className="flex flex-wrap gap-3">
                <Button
                  asChild
                  className="rounded-md border border-zinc-500 bg-zinc-100 px-4 py-2 text-xs uppercase tracking-[0.2em] text-zinc-900"
                >
                  <Link href="/duels">Open Duels</Link>
                </Button>
                <Badge className="rounded-md border border-dashed border-[#ff4f00]/70 bg-[#ff4f00]/10 px-3 py-2 text-[10px] uppercase tracking-[0.2em] text-[#ff8a50]">
                  Best Feature
                </Badge>
              </div>
              <SignInAction />
            </div>
            <div className="space-y-4 border-t border-dashed border-zinc-700 pt-6 lg:border-l lg:border-t-0 lg:pl-8 lg:pt-0">
              {duelSignals.map((point) => (
                <Card
                  key={point}
                  className="rounded-md border-dashed border-zinc-700 bg-zinc-900/55 transition-transform duration-300 hover:-translate-y-0.5"
                >
                  <CardContent className="flex items-start gap-3 px-4 py-4 text-base text-zinc-300">
                    <HugeiconsIcon
                      icon={ViewIcon}
                      size={18}
                      className="mt-0.5 text-[#ff4f00]"
                      strokeWidth={1.8}
                    />
                    <span>{point}</span>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        <SectionBlock
          index="01 / Codeforces Performance Analytics"
          title="Intelligence layer for rating bottlenecks"
          body="Track tag-wise failure gradients instead of raw solve counts. See where your logic collapses by rating band, monitor trend slope over time, and run delta prediction from recent duel outcomes and solve latency."
          points={[
            "Detects mismatch: #dp stable at 1600, unstable at 1800",
            "Visualized trend-lines for solve rate and wrong-answer density",
            "Delta prediction from recent duel close-rate and verdict history",
            "Heuristics flag logic bottlenecks before the next rated round",
          ]}
          variant="rail"
        />

        <SectionBlock
          index="03 / Discovery Engine"
          title="Anti-slump filtering at metadata speed"
          body="Query the Codeforces set with sub-second latency across tags, ratings, and solve counts. Anti-Slump mode removes problems already solved or seen, forcing fresh attempts near your current limit."
          points={discoverySignals}
          variant="stack"
        />

        <SectionBlock
          index="04 / Snippet System"
          title="Algorithm vault as physical memory"
          body="Treat your template library as persistent memory: inject hot snippets during practice or duels, fork community-optimized implementations, and keep every algorithm versioned with clean rollback points."
          points={snippetSignals}
          variant="split"
        />

        <footer className="relative overflow-hidden rounded-2xl border border-dashed border-zinc-700/80 bg-zinc-950/70 p-7 sm:p-10 lg:min-h-[82vh] lg:p-14">
          <div className="pointer-events-none absolute inset-0 bg-[repeating-linear-gradient(-45deg,rgba(255,255,255,0.018)_0px,rgba(255,255,255,0.018)_1px,transparent_1px,transparent_7px)]" />
          <div className="relative grid h-full content-center gap-6">
            <p className="text-[11px] uppercase tracking-[0.22em] text-zinc-500">
              06 / Technical Specs
            </p>
            <div className="flex flex-wrap gap-2">
              <Badge className="rounded-sm border border-dashed border-zinc-700 bg-zinc-900/70 text-zinc-400">
                <HugeiconsIcon icon={CodeIcon} size={14} className="mr-1.5" />
                Judge Sandboxes
              </Badge>
              <Badge className="rounded-sm border border-dashed border-zinc-700 bg-zinc-900/70 text-zinc-400">
                <HugeiconsIcon
                  icon={Clock01Icon}
                  size={14}
                  className="mr-1.5 text-[#ff4f00]"
                />
                Low Latency
              </Badge>
              <Badge className="rounded-sm border border-dashed border-zinc-700 bg-zinc-900/70 text-zinc-400">
                <HugeiconsIcon icon={KeyboardIcon} size={14} className="mr-1.5" />
                Versioned Snippets
              </Badge>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <Card className="rounded-md border-dashed border-zinc-700 bg-zinc-900/50">
                <CardContent className="px-4 py-4 text-base text-zinc-300">
                Isolated Linux-based judge sandboxes
                </CardContent>
              </Card>
              <Card className="rounded-md border-dashed border-zinc-700 bg-zinc-900/50">
                <CardContent className="px-4 py-4 text-base text-zinc-300">
                GCC 13+ (C++20), Java 21, Python 3.11
                </CardContent>
              </Card>
              <Card className="rounded-md border-dashed border-zinc-700 bg-zinc-900/50 sm:col-span-2">
                <CardContent className="px-4 py-4 text-base text-zinc-300">
                Codeforces compliance: no restricted content re-hosting, only
                metadata sync and redirection to official sources
                </CardContent>
              </Card>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}
