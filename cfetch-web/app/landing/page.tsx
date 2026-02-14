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
    <div className="min-h-screen bg-stone-950 px-4 py-6 text-stone-100 sm:px-6 sm:py-8">
      <main className="mx-auto w-full max-w-6xl space-y-6">
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

        <section className="grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-xl border border-stone-800 bg-stone-900/65 p-5 sm:p-6">
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

            <h1 className="max-w-2xl font-[family-name:var(--font-geist-pixel-triangle)] text-4xl leading-tight tracking-tight text-stone-100 sm:text-5xl lg:text-6xl">
              Train sharper. Ship faster. Climb cleaner.
            </h1>

            <p className="mt-5 max-w-xl text-sm leading-relaxed text-stone-300 sm:text-base">
              Organize templates, track Codeforces patterns, and prep with
              context. A neutral workspace designed for focused iteration.
            </p>

            <div className="mt-6 flex flex-wrap items-center gap-3">
              <SignIn />
            </div>
          </div>

          <Card className="overflow-hidden rounded-xl border-stone-800 bg-stone-900/65">
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
            <CardContent className="space-y-3 pt-4">
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

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {[
            {
              title: "Snippet vault",
              desc: "Tag, version, and instantly fetch templates.",
              icon: CodeIcon,
            },
            {
              title: "Tag analytics",
              desc: "Map weak areas from solved/unsolved history.",
              icon: SearchIcon,
            },
            {
              title: "Contest history",
              desc: "Review consistency and rating movement per round.",
              icon: KeyboardIcon,
            },
            {
              title: "Prep timeline",
              desc: "Set revision windows before every rated contest.",
              icon: TimeQuarterPassIcon,
            },
          ].map((item) => (
            <Card
              key={item.title}
              className="rounded-xl border-stone-800 bg-stone-900/65"
            >
              <CardHeader className="space-y-2">
                <HugeiconsIcon
                  icon={item.icon}
                  size={20}
                  strokeWidth={1.7}
                  className="text-stone-400"
                />
                <CardTitle className="text-sm font-semibold text-stone-200">
                  {item.title}
                </CardTitle>
                <CardDescription className="text-sm text-stone-400">
                  {item.desc}
                </CardDescription>
              </CardHeader>
            </Card>
          ))}
        </section>

        <section className="rounded-xl border border-stone-800 bg-stone-900/65 p-5 sm:p-6">
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
