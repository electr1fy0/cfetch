import Link from "next/link";
import { signIn } from "@/auth";
import { cookies } from "next/headers";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { GetStartedFlow } from "@/components/get-started-flow";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  CodeIcon,
} from "@hugeicons/core-free-icons";
import { redirect } from "next/navigation";
import { Activity, Swords, Filter, Target } from "lucide-react";

const marqueeFeed = [
  "Live Codeforces Rating Updates",
  "Head-to-Head Duels",
  "Smart Problem Filtering",
  "Performance Analytics",
  "Solve History Tracking",
];

export default async function Landing() {
  return (
    <div className="h-screen overflow-hidden bg-[#070707] px-4 py-6 text-zinc-100 sm:px-6 sm:py-8">
      <main className="mx-auto flex h-full max-w-7xl flex-col font-[family-name:var(--font-geist-mono)]">
        <section className="relative flex min-h-0 flex-1 flex-col overflow-hidden rounded-3xl border border-zinc-700/70 bg-[#171717]">
          <div className="pointer-events-none absolute inset-0 bg-[repeating-linear-gradient(-45deg,rgba(255,255,255,0.02)_0px,rgba(255,255,255,0.02)_1px,transparent_1px,transparent_7px)]" />

          <header className="relative flex items-center justify-between gap-3 border-b border-dashed border-zinc-700/70 px-4 py-3 sm:px-6">
            <p className="text-xs uppercase tracking-[0.24em] text-zinc-400">
              Cfetch
            </p>
            <form
              action={async () => {
                "use server";
                await signIn("google", { redirectTo: "/auth" });
              }}
            >
              <Button
                type="submit"
                variant="outline"
                className="h-8 flex items-center rounded-md border-zinc-700 bg-zinc-900/70 px-3 text-[10px] font-normal uppercase tracking-[0.2em] text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200"
              >
                <img
                  src="https://authjs.dev/img/providers/google.svg"
                  alt="Google"
                  className="mr-2 h-3.5 w-3.5"
                />
                Get Started
              </Button>
            </form>
          </header>

          <div className="relative grid flex-1 content-center gap-8 p-5 sm:p-7 lg:grid-cols-[1.1fr_0.9fr] lg:gap-10 lg:p-10">
            <div className="space-y-6">
              <p className="text-xs uppercase tracking-[0.24em] text-zinc-400">
                Live Duels & Analytics
              </p>
              <h1 className="font-[family-name:var(--font-geist-pixel-square)] text-3xl leading-[1.04] text-zinc-50 sm:text-5xl">
                Dominate the arena with live 1v1 duels.
              </h1>
              <p className="max-w-2xl text-base leading-relaxed text-zinc-300 sm:text-lg">
                Real-time 1v1 duels on competitive algorithm problems, deep
                performance analytics, and smart discovery.
              </p>
              <GetStartedFlow />
            </div>

            <div className="flex flex-col justify-center">
              <div className="grid grid-cols-2 gap-4">
                <Card className="flex flex-col items-center justify-center gap-4 border-dashed border-zinc-700 bg-zinc-900/50 p-6 text-center transition-all hover:bg-zinc-900/80 hover:border-zinc-600">
                  <div className="flex size-12 items-center justify-center rounded-full bg-purple-500/10 text-purple-400">
                    <Activity className="size-6" />
                  </div>
                  <div className="space-y-1">
                    <p className="font-medium text-zinc-200">Deep Analytics</p>
                    <p className="text-xs text-zinc-500">Visualize progress</p>
                  </div>
                </Card>
                <Card className="flex flex-col items-center justify-center gap-4 border-dashed border-zinc-700 bg-zinc-900/50 p-6 text-center transition-all hover:bg-zinc-900/80 hover:border-zinc-600">
                  <div className="flex size-12 items-center justify-center rounded-full bg-amber-500/10 text-amber-400">
                    <Swords className="size-6" />
                  </div>
                  <div className="space-y-1">
                    <p className="font-medium text-zinc-200">Live Duels</p>
                    <p className="text-xs text-zinc-500">Challenge friends</p>
                  </div>
                </Card>
                <Card className="flex flex-col items-center justify-center gap-4 border-dashed border-zinc-700 bg-zinc-900/50 p-6 text-center transition-all hover:bg-zinc-900/80 hover:border-zinc-600">
                  <div className="flex size-12 items-center justify-center rounded-full bg-blue-500/10 text-blue-400">
                    <Filter className="size-6" />
                  </div>
                  <div className="space-y-1">
                    <p className="font-medium text-zinc-200">Smart Filters</p>
                    <p className="text-xs text-zinc-500">Find problems fast</p>
                  </div>
                </Card>
                <Card className="flex flex-col items-center justify-center gap-4 border-dashed border-zinc-700 bg-zinc-900/50 p-6 text-center transition-all hover:bg-zinc-900/80 hover:border-zinc-600">
                  <div className="flex size-12 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-400">
                    <Target className="size-6" />
                  </div>
                  <div className="space-y-1">
                    <p className="font-medium text-zinc-200">Goal Tracking</p>
                    <p className="text-xs text-zinc-500">Hit your targets</p>
                  </div>
                </Card>
              </div>
            </div>
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
      </main>
    </div>
  );
}