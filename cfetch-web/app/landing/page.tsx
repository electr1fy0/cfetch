import { signIn, auth } from "@/auth";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  ArrowRight01Icon,
  CodeIcon,
  KeyboardIcon,
  LayoutIcon,
  SearchIcon,
  TimeQuarterPassIcon,
} from "@hugeicons/core-free-icons";
import Image from "next/image";

function SignIn({ className }: { className?: string }) {
  return (
    <form
      action={async () => {
        "use server";
        await signIn("google");
      }}
      className={className}
    >
      <Button
        type="submit"
        className="group h-10 rounded-md border border-stone-700 bg-stone-100 px-4 font-[family-name:var(--font-geist-mono)] text-xs font-semibold uppercase tracking-wide text-stone-900 hover:bg-white"
      >
        <span className="mr-2 inline-flex size-4 items-center justify-center rounded-full bg-white">
          <Image
            src="https://www.google.com/images/branding/googleg/1x/googleg_standard_color_128dp.png"
            alt="Google logo"
            width={14}
            height={14}
          />
        </span>
        Sign in with Google
        <HugeiconsIcon
          icon={ArrowRight01Icon}
          size={14}
          className="ml-2 transition-transform group-hover:translate-x-0.5"
          strokeWidth={2}
        />
      </Button>
    </form>
  );
}

const signalRows = [
  { label: "Rating momentum", value: "+132" },
  { label: "Tag focus", value: "graphs" },
  { label: "Next contest", value: "in 5h" },
];
export default function Landing() {
  return (
    <div className="min-h-screen bg-stone-950 px-4 py-8 text-stone-100 sm:px-6 sm:py-12">
      <main className="mx-auto w-full max-w-6xl space-y-12 sm:space-y-16">
        <header className="rounded-xl border border-stone-800 bg-stone-900/70 p-4">
          <div className="mb-4 flex items-center justify-between font-[family-name:var(--font-geist-mono)] text-[11px] uppercase tracking-[0.14em] text-stone-500">
            <span>cfetch://landing</span>
            <span>session active</span>
          </div>
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-stone-800 pt-4">
            <div className="flex items-center gap-3">
              <div className="rounded-md border border-stone-700 bg-stone-950 px-2 py-1 font-[family-name:var(--font-geist-mono)] text-xs text-stone-300">
                CF
              </div>
              <div>
                <p className="text-lg font-semibold leading-none">cfetch</p>
                <p className="font-[family-name:var(--font-geist-mono)] text-[11px] uppercase tracking-wide text-stone-500">
                  competition cockpit
                </p>
              </div>
            </div>
            <Badge className="rounded-md border border-stone-700 bg-stone-950 font-[family-name:var(--font-geist-mono)] text-[11px] uppercase tracking-wide text-stone-300">
              build v0.3
            </Badge>
          </div>
        </header>

        <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr] lg:gap-8">
          <div className="rounded-xl border border-stone-800 bg-stone-900/65 p-6 sm:p-8 lg:min-h-[34rem] lg:py-10">
            <div className="mb-5 flex flex-wrap gap-2 font-[family-name:var(--font-geist-mono)] text-[11px] uppercase tracking-wide">
              <Badge className="rounded-md border border-stone-700 bg-stone-950 text-stone-400">
                snippets
              </Badge>
              <Badge className="rounded-md border border-stone-700 bg-stone-950 text-stone-400">
                analytics
              </Badge>
              <Badge className="rounded-md border border-stone-700 bg-stone-950 text-stone-400">
                contests
              </Badge>
            </div>

            <h1 className="max-w-2xl font-[family-name:var(--font-geist-pixel-triangle)] text-3xl leading-tight tracking-tight text-stone-100 sm:text-5xl lg:text-6xl">
              Train sharper.
              <br /> Ship faster.
              <br /> Climb cleaner.
            </h1>

            <p className="mt-5 max-w-xl text-sm leading-relaxed text-stone-300 sm:text-base">
              Organize templates, track Codeforces patterns, and prep with
              context. A neutral workspace designed for focused iteration.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <SignIn />
            </div>
          </div>

          <Card className="overflow-hidden rounded-xl border-stone-800 bg-stone-900/65 lg:min-h-[34rem]">
            <CardHeader className="border-b border-stone-800 pb-4">
              <div className="mb-2 flex items-center justify-between">
                <CardTitle className="text-base font-semibold">
                  Live session panel
                </CardTitle>
                <HugeiconsIcon
                  icon={LayoutIcon}
                  size={18}
                  strokeWidth={1.8}
                  className="text-stone-400"
                />
              </div>
              <CardDescription className="font-[family-name:var(--font-geist-mono)] text-[11px] uppercase tracking-wide text-stone-500">
                current prep loop snapshot
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 pt-5">
              <div className="rounded-lg border border-stone-800 bg-stone-950 p-3">
                <p className="mb-2 font-[family-name:var(--font-geist-mono)] text-[11px] uppercase tracking-wide text-stone-500">
                  active snippets
                </p>
                <div className="space-y-1 font-[family-name:var(--font-geist-mono)] text-xs text-stone-300">
                  <p>binary_search.cpp</p>
                  <p>sparse_table.cpp</p>
                  <p>digit_dp.java</p>
                </div>
              </div>
              <div className="rounded-lg border border-stone-800 bg-stone-950 p-3">
                <p className="mb-2 font-[family-name:var(--font-geist-mono)] text-[11px] uppercase tracking-wide text-stone-500">
                  signals
                </p>
                <div className="space-y-2">
                  {signalRows.map((row) => (
                    <div
                      key={row.label}
                      className="flex items-center justify-between border-b border-stone-800 pb-2 last:border-0 last:pb-0"
                    >
                      <span className="font-[family-name:var(--font-geist-mono)] text-xs uppercase tracking-wide text-stone-500">
                        {row.label}
                      </span>
                      <span className="font-[family-name:var(--font-geist-mono)] text-sm font-semibold text-stone-200">
                        {row.value}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        <section className="space-y-5">
          <div className="space-y-2">
            <p className="font-[family-name:var(--font-geist-mono)] text-[11px] uppercase tracking-[0.14em] text-stone-500">
              core modules
            </p>
            <h2 className="text-2xl text-stone-100 sm:text-3xl">
              Built as a large, scroll-first prep surface.
            </h2>
          </div>
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-12 xl:auto-rows-[minmax(180px,auto)]">
            <Card className="rounded-xl border-stone-800 bg-stone-900/65 xl:col-span-7 xl:row-span-2">
              <CardHeader className="space-y-3 p-6 sm:p-8">
                <HugeiconsIcon
                  icon={CodeIcon}
                  size={24}
                  strokeWidth={1.7}
                  className="text-stone-400"
                />
                <CardTitle className="text-xl text-stone-100">
                  Snippet vault
                </CardTitle>
                <CardDescription className="max-w-xl text-base text-stone-400">
                  Tag, version, and instantly fetch templates. Keep canonical
                  snippets separated from contest-specific scratch code.
                </CardDescription>
              </CardHeader>
              <CardContent className="grid gap-3 px-6 pb-6 sm:px-8 sm:pb-8 md:grid-cols-2">
                <div className="rounded-lg border border-stone-800 bg-stone-950 p-4">
                  <p className="font-[family-name:var(--font-geist-mono)] text-[11px] uppercase tracking-wide text-stone-500">
                    indexed files
                  </p>
                  <p className="mt-2 text-2xl text-stone-200">142</p>
                </div>
                <div className="rounded-lg border border-stone-800 bg-stone-950 p-4">
                  <p className="font-[family-name:var(--font-geist-mono)] text-[11px] uppercase tracking-wide text-stone-500">
                    hot snippets
                  </p>
                  <p className="mt-2 text-2xl text-stone-200">31</p>
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-xl border-stone-800 bg-stone-900/65 xl:col-span-5">
              <CardHeader className="space-y-2 p-6">
                <HugeiconsIcon
                  icon={SearchIcon}
                  size={22}
                  strokeWidth={1.7}
                  className="text-stone-400"
                />
                <CardTitle className="text-lg text-stone-200">
                  Tag analytics
                </CardTitle>
                <CardDescription className="text-sm text-stone-400">
                  Map weak areas from solved/unsolved history.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="rounded-xl border-stone-800 bg-stone-900/65 xl:col-span-5">
              <CardHeader className="space-y-2 p-6">
                <HugeiconsIcon
                  icon={KeyboardIcon}
                  size={22}
                  strokeWidth={1.7}
                  className="text-stone-400"
                />
                <CardTitle className="text-lg text-stone-200">
                  Contest history
                </CardTitle>
                <CardDescription className="text-sm text-stone-400">
                  Review consistency and rating movement per round.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="rounded-xl border-stone-800 bg-stone-900/65 md:col-span-2 xl:col-span-12">
              <CardHeader className="space-y-2 p-6 sm:p-8">
                <HugeiconsIcon
                  icon={TimeQuarterPassIcon}
                  size={22}
                  strokeWidth={1.7}
                  className="text-stone-400"
                />
                <CardTitle className="text-lg text-stone-200">
                  Prep timeline
                </CardTitle>
                <CardDescription className="text-sm text-stone-400">
                  Set revision windows before every rated contest.
                </CardDescription>
              </CardHeader>
              <CardContent className="grid gap-3 px-6 pb-6 sm:px-8 sm:pb-8 md:grid-cols-3">
                {["D-7: weak tags", "D-3: virtual contest", "D-1: speed drills"].map(
                  (item) => (
                    <div
                      key={item}
                      className="rounded-lg border border-stone-800 bg-stone-950 p-4 font-[family-name:var(--font-geist-mono)] text-xs uppercase tracking-wide text-stone-400"
                    >
                      {item}
                    </div>
                  ),
                )}
              </CardContent>
            </Card>
          </div>
        </section>

        <section className="rounded-xl border border-stone-800 bg-stone-900/65 p-6 sm:p-8 lg:p-10">
          <div className="space-y-6">
            <p className="font-[family-name:var(--font-geist-mono)] text-[11px] uppercase tracking-[0.14em] text-stone-500">
              workflow
            </p>
            <div className="grid gap-4 md:grid-cols-3">
              {[
                "Collect new snippets after every contest and tag by pattern.",
                "Review tag distribution and identify low-volume weak clusters.",
                "Run targeted practice blocks and compare rating deltas.",
              ].map((step, idx) => (
                <div
                  key={step}
                  className="min-h-40 rounded-lg border border-stone-800 bg-stone-950 p-5"
                >
                  <p className="font-[family-name:var(--font-geist-mono)] text-[11px] uppercase tracking-wide text-stone-500">
                    step {idx + 1}
                  </p>
                  <p className="mt-3 text-sm leading-relaxed text-stone-300">
                    {step}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="rounded-xl border border-stone-800 bg-stone-900/65 p-6 sm:p-8 lg:p-10">
          <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="font-[family-name:var(--font-geist-mono)] text-[11px] uppercase tracking-[0.14em] text-stone-500">
                ready
              </p>
              <h2 className="mt-2 text-2xl   text-stone-100 sm:text-3xl">
                Keep your competitive workflow in one calm interface.
              </h2>
              <p className="mt-2 text-sm text-stone-400 sm:text-base">
                Sign in once and start with snippets, analytics, and contest
                prep already connected.
              </p>
            </div>
            <SignIn className="shrink-0" />
          </div>
        </section>
      </main>
    </div>
  );
}
