"use client";

import { useMemo, useState } from "react";
import { Editor } from "@monaco-editor/react";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  ArrowDown01Icon,
  ArrowUp01Icon,
  Clock01Icon,
  ViewIcon,
} from "@hugeicons/core-free-icons";

import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type ProblemState = "live" | "won_you" | "won_opp" | "pending";

type DuelProblem = {
  id: string;
  title: string;
  difficulty: "Easy" | "Medium" | "Hard";
  state: ProblemState;
  description: string;
  examples: Array<{ input: string; output: string; note?: string }>;
  formalDefinition?: string[];
  inputSpec?: string[];
  outputSpec?: string[];
  guarantees?: string[];
  sampleInput?: string;
  sampleOutput?: string;
  notes?: string[];
  testsPassed: { you: number; opp: number; total: number };
};

const problems: DuelProblem[] = [
  {
    id: "P1",
    title: "Many Many Heads",
    difficulty: "Medium",
    state: "live",
    description: `Multi-Heads Cup (MHC) assigns each participant a unique balanced bracket sequence using () and [].

Participants cannot distinguish bracket directions, so each bracket may be remembered reversed, but bracket type remains the same. Given a memorized sequence S, determine whether it maps to exactly one original balanced bracket sequence.
Output Yes iff exactly one original balanced sequence can produce S after direction flips; otherwise output No.`,
    examples: [
      { input: "S = ))", output: "Yes", note: "Unique original: ()" },
      { input: "S = ((()", output: "No", note: "Could be (()) or ()()" },
      { input: "S = [()]", output: "Yes" },
    ],
    formalDefinition: [
      "ε (empty string) is balanced.",
      "If A is balanced, then (A) and [A] are balanced.",
      "If A and B are balanced, then AB is balanced.",
      'Examples balanced: "()", "[()]", "[()]()".',
      'Examples not balanced: ")(", "[(])", "[)".',
    ],
    inputSpec: [
      "First line: integer T, number of test cases.",
      "For each test case: one string S of characters (, ), [, ].",
    ],
    outputSpec: [
      "For each test case output one line:",
      "Yes -> exactly one balanced original sequence maps to S.",
      "No -> more than one balanced original sequence maps to S.",
    ],
    guarantees: [
      "1 <= |S| <= 1e5 for each test case.",
      "Sum of |S| over all test cases <= 1e6.",
      "Each S is obtained from some balanced sequence by flipping directions.",
    ],
    sampleInput: `6
))
((()
[()]
()[()]()
([()])
([])([])`,
    sampleOutput: `Yes
No
Yes
No
Yes
No`,
    notes: [
      "S = )) maps uniquely to ().",
      "S = ((() maps to both (()) and ()().",
      "S = ()[()]() has multiple possible originals, so answer is No.",
      "S = ([])([]) has three valid originals in the official note.",
    ],
    testsPassed: { you: 18, opp: 21, total: 25 },
  },
  {
    id: "P2",
    title: "Find Peak Element",
    difficulty: "Medium",
    state: "won_you",
    description:
      "Given an array nums, return the index of any peak element. A peak element is strictly greater than its neighbors.",
    examples: [{ input: "nums = [1,2,3,1]", output: "2" }],
    testsPassed: { you: 18, opp: 15, total: 18 },
  },
  {
    id: "P3",
    title: "Merge Intervals",
    difficulty: "Hard",
    state: "pending",
    description:
      "Merge overlapping intervals and return the minimal set of non-overlapping intervals.",
    examples: [
      {
        input: "intervals = [[1,3],[2,6],[8,10],[15,18]]",
        output: "[[1,6],[8,10],[15,18]]",
      },
    ],
    testsPassed: { you: 0, opp: 0, total: 22 },
  },
];

const opponentLog = [
  { at: "12:01:08", type: "compile", msg: "Build succeeded", tone: "ok" },
  { at: "12:01:44", type: "submit", msg: "Submitted P1 attempt #4", tone: "neutral" },
  { at: "12:02:10", type: "verdict", msg: "WA on case #05", tone: "warn" },
  { at: "12:02:56", type: "submit", msg: "Submitted P1 attempt #5", tone: "neutral" },
  { at: "12:03:23", type: "verdict", msg: "Passed 21/25", tone: "ok" },
  { at: "12:04:02", type: "switch", msg: "Switched to P2", tone: "neutral" },
  { at: "12:04:31", type: "compile", msg: "Compile error fixed", tone: "ok" },
];

const starterCode = `class Solution {
public:
  int lengthOfLongestSubstring(string s) {
    int left = 0, best = 0;
    unordered_map<char, int> seen;
    for (int right = 0; right < s.size(); right++) {
      seen[s[right]]++;
      while (seen[s[right]] > 1) {
        seen[s[left]]--;
        left++;
      }
      best = max(best, right - left + 1);
    }
    return best;
  }
};`;

function defineTheme(monaco: any) {
  monaco.editor.defineTheme("cfetch-one-dark", {
    base: "vs-dark",
    inherit: true,
    rules: [
      { token: "keyword", foreground: "FF4FA3" },
      { token: "string", foreground: "00D084" },
      { token: "number", foreground: "41B9FF" },
      { token: "comment", foreground: "7A7A7A", fontStyle: "italic" },
      { token: "function", foreground: "C56CFF" },
      { token: "type", foreground: "41B9FF" },
    ],
    colors: {
      "editor.background": "#0a0a0a",
      "editor.foreground": "#EAEAEA",
      "editorLineNumber.foreground": "#616161",
      "editorCursor.foreground": "#ff4f00",
      "editor.selectionBackground": "#2A2A2A",
    },
  });
}

export default function DuelsPage() {
  const [activeProblemId, setActiveProblemId] = useState("P1");
  const [code, setCode] = useState(starterCode);
  const [logIndex, setLogIndex] = useState(opponentLog.length - 1);

  const activeProblem =
    problems.find((problem) => problem.id === activeProblemId) ?? problems[0];

  const summary = useMemo(() => {
    const base = { youWins: 0, oppWins: 0, live: 0 };
    for (const problem of problems) {
      if (problem.state === "won_you") base.youWins += 1;
      if (problem.state === "won_opp") base.oppWins += 1;
      if (problem.state === "live") base.live += 1;
    }
    return base;
  }, []);

  const activeLogEvent = opponentLog[logIndex];

  return (
    <main className="h-screen overflow-hidden bg-[#070707] px-4 py-4 text-zinc-100 md:px-6 md:py-6">
      <div className="mx-auto flex h-full w-full max-w-[1580px] min-h-0 flex-col gap-3 font-[family-name:var(--font-geist-mono)] xl:flex-row">
        <div className="flex min-h-0 flex-col gap-3 xl:w-1/2 xl:min-w-0">
          <Card className="shrink-0 overflow-visible border-dashed border-zinc-700/80 bg-[#171717]">
          <CardContent className="space-y-1.5 overflow-visible py-2.5">
            <div className="grid items-center gap-2 xl:grid-cols-[1fr_auto_1fr]">
              <div className="flex items-center gap-2">
                <Badge className="border-dashed border-zinc-700 bg-zinc-900/70 text-zinc-300">
                  Match #8421
                </Badge>
              </div>
              <div className="flex items-center justify-center gap-2">
                <div className="flex items-center gap-1.5 rounded-md border border-dashed border-zinc-700 bg-zinc-950/80 px-1.5 py-1">
                  <Avatar className="size-6">
                    <AvatarFallback>YU</AvatarFallback>
                  </Avatar>
                  <span className="text-xs text-zinc-300">you</span>
                </div>
                <div className="flex items-center gap-1.5 rounded-md border border-dashed border-zinc-700 bg-zinc-950/80 px-1.5 py-1">
                  <Avatar className="size-6">
                    <AvatarFallback>OP</AvatarFallback>
                  </Avatar>
                  <span className="text-xs text-zinc-300">opponent</span>
                </div>
              </div>
              <div className="flex items-center justify-start gap-2 text-xs text-zinc-400 xl:justify-end">
                <HugeiconsIcon icon={Clock01Icon} size={14} className="text-[#ff4f00]" />
                12:42 remaining
              </div>
            </div>

            <div className="flex items-center gap-2 pb-1">
              <div className="flex min-w-0 items-center gap-2 overflow-x-auto whitespace-nowrap">
                {problems.map((problem) => (
                  <Button
                    key={problem.id}
                    size="sm"
                    onClick={() => setActiveProblemId(problem.id)}
                    className={`relative h-8 min-w-9 shrink-0 overflow-hidden border-dashed px-0 text-[11px] ${
                      problem.id === activeProblem.id
                        ? "border-[#ff4f00]/70 bg-[#ff4f00]/10 text-[#ff8a50]"
                        : "border-zinc-700 bg-zinc-900/70 text-zinc-200"
                    }`}
                  >
                    <span
                      className="absolute inset-y-1 left-1/2 w-px -translate-x-1/2 rounded-full bg-zinc-600/35"
                    />
                    <span className="relative z-10">{problem.id.replace("P", "")}</span>
                  </Button>
                ))}
              </div>

              <div className="ml-auto flex shrink-0 items-center gap-2">
                <Button
                  size="sm"
                  className="h-8 border border-dashed border-zinc-600 bg-zinc-900 px-4 text-xs text-zinc-100 hover:bg-zinc-800"
                >
                  Run
                </Button>
                <Button
                  size="sm"
                  className="h-8 border border-[#ff4f00]/80 bg-[#ff4f00] px-4 text-xs text-white hover:bg-[#e64700]"
                >
                  Submit
                </Button>
              </div>
            </div>

            <div className="my-1.5 flex h-10 w-full min-w-0 items-center gap-2 rounded-md border border-dashed border-zinc-700 bg-zinc-950/80 px-3">
              <div className="flex min-w-0 flex-1 items-center gap-2">
                <HugeiconsIcon icon={ViewIcon} size={14} className="text-[#ff4f00]" />
                <Badge className="h-6 border-dashed border-zinc-700 bg-zinc-900/80 px-2 text-[10px] text-zinc-400">
                  OPP LOG
                </Badge>
                <span className="text-xs text-zinc-500">{activeLogEvent.at}</span>
                <Badge className="h-6 border-dashed border-zinc-700 bg-zinc-900/80 px-2 text-[10px] text-zinc-400">
                  {activeLogEvent.type}
                </Badge>
                <span className="min-w-0 flex-1 truncate text-sm text-zinc-300">
                  {activeLogEvent.msg}
                </span>
              </div>
              <div className="ml-auto flex shrink-0 items-center gap-2">
                <span
                  className={`size-1.5 rounded-full ${
                    activeLogEvent.tone === "ok"
                      ? "bg-emerald-300"
                      : activeLogEvent.tone === "warn"
                        ? "bg-[#ff4f00]"
                        : "bg-zinc-500"
                  }`}
                />
                <span className="text-[11px] text-zinc-500">
                  {logIndex + 1}/{opponentLog.length}
                </span>
                <Button
                  size="sm"
                  onClick={() => setLogIndex((v) => Math.max(0, v - 1))}
                  disabled={logIndex === 0}
                  className="h-7 w-7 border border-dashed border-zinc-700 bg-zinc-900 p-0 text-zinc-300 hover:bg-zinc-800 disabled:opacity-40"
                >
                  <HugeiconsIcon icon={ArrowUp01Icon} size={13} />
                </Button>
                <Button
                  size="sm"
                  onClick={() =>
                    setLogIndex((v) => Math.min(opponentLog.length - 1, v + 1))
                  }
                  disabled={logIndex === opponentLog.length - 1}
                  className="h-7 w-7 border border-dashed border-zinc-700 bg-zinc-900 p-0 text-zinc-300 hover:bg-zinc-800 disabled:opacity-40"
                >
                  <HugeiconsIcon icon={ArrowDown01Icon} size={13} />
                </Button>
              </div>
            </div>

          </CardContent>
        </Card>

          <Card className="min-h-0 flex-1 border-dashed border-zinc-700/80 bg-[#171717]">
            <CardContent className="min-h-0 overflow-y-auto pb-5 pt-3 [font-family:Inter,sans-serif]">
              <div className="space-y-5 px-1 text-zinc-300">
                <section className="space-y-3">
                  <div>
                    <h2 className="text-4xl tracking-tight text-zinc-100">{activeProblem.title}</h2>
                    <p className="mt-1 text-sm text-zinc-500">Problem {activeProblem.id}</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Badge className="border-dashed border-zinc-700 bg-zinc-900/70 text-zinc-300">
                      {activeProblem.difficulty}
                    </Badge>
                    {(activeProblem.guarantees ?? []).map((g) => (
                      <Badge
                        key={g}
                        className="border-dashed border-zinc-700 bg-zinc-900/70 text-zinc-300"
                      >
                        {g}
                      </Badge>
                    ))}
                  </div>
                </section>

                <section className="space-y-2">
                  <h3 className="text-xl text-zinc-100">Description</h3>
                  <div className="space-y-3 text-[15px] leading-7">
                    {activeProblem.description.split("\n\n").map((para, idx) => (
                      <p key={`desc-${idx}`}>{para}</p>
                    ))}
                  </div>
                </section>

                {activeProblem.inputSpec?.length ? (
                  <section className="space-y-2">
                    <h3 className="text-xl text-zinc-100">Input</h3>
                    <div className="space-y-1.5 text-[15px] leading-7">
                      {activeProblem.inputSpec.map((line) => (
                        <p key={line}>{line}</p>
                      ))}
                    </div>
                  </section>
                ) : null}

                {activeProblem.outputSpec?.length ? (
                  <section className="space-y-2">
                    <h3 className="text-xl text-zinc-100">Output</h3>
                    <div className="space-y-1.5 text-[15px] leading-7">
                      {activeProblem.outputSpec.map((line) => (
                        <p key={line}>{line}</p>
                      ))}
                    </div>
                  </section>
                ) : null}

                {(activeProblem.sampleInput || activeProblem.sampleOutput) ? (
                  <section className="space-y-2">
                    <h3 className="text-xl text-zinc-100">Sample</h3>
                    <div className="grid gap-3 lg:grid-cols-2">
                      {activeProblem.sampleInput ? (
                        <div className="rounded-lg border border-dashed border-zinc-700 bg-zinc-950/65 p-3">
                          <p className="mb-2 text-xs uppercase tracking-[0.14em] text-zinc-500">
                            Sample Input
                          </p>
                          <pre className="overflow-x-auto font-mono text-xs text-zinc-200">
                            {activeProblem.sampleInput}
                          </pre>
                        </div>
                      ) : null}
                      {activeProblem.sampleOutput ? (
                        <div className="rounded-lg border border-dashed border-zinc-700 bg-zinc-950/65 p-3">
                          <p className="mb-2 text-xs uppercase tracking-[0.14em] text-zinc-500">
                            Sample Output
                          </p>
                          <pre className="overflow-x-auto font-mono text-xs text-zinc-200">
                            {activeProblem.sampleOutput}
                          </pre>
                        </div>
                      ) : null}
                    </div>
                  </section>
                ) : null}

                {activeProblem.notes?.length ? (
                  <section className="space-y-2">
                    <h3 className="text-xl text-zinc-100">Note</h3>
                    <div className="space-y-1.5 text-[15px] leading-7">
                      {activeProblem.notes.map((line) => (
                        <p key={line}>{line}</p>
                      ))}
                    </div>
                  </section>
                ) : null}
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="flex h-full min-h-0 flex-col border-dashed border-zinc-700/80 bg-[#171717] xl:flex-1 xl:min-w-0">
          <CardContent className="min-h-0 flex-1 space-y-2 overflow-y-auto pt-4">
            <div className="h-[68vh] min-h-[520px] overflow-hidden rounded-lg border border-dashed border-zinc-700">
              <Editor
                theme="cfetch-one-dark"
                defaultLanguage="cpp"
                value={code}
                beforeMount={defineTheme}
                onChange={(value) => setCode(value || "")}
                options={{
                  fontSize: 13,
                  minimap: { enabled: false },
                  scrollBeyondLastLine: false,
                  padding: { top: 12, bottom: 12 },
                }}
              />
            </div>

            <div className="grid min-h-0 gap-2">
              <Card className="max-h-[250px] overflow-hidden border-dashed border-zinc-700 bg-zinc-950/70">
                <CardHeader className="pb-1.5">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-xs uppercase tracking-[0.16em] text-zinc-500">
                      Your Test Runs
                    </CardTitle>
                    <Badge className="border-dashed border-zinc-700 bg-zinc-900/70 text-zinc-400">
                      custom cases
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3 overflow-y-auto px-4 pb-4 pt-2">
                  <Card className="border-dashed border-zinc-700 bg-zinc-900/70">
                    <CardContent className="space-y-1 px-3 py-3 text-sm text-zinc-300">
                      <p className="text-zinc-400">Input</p>
                      <pre className="font-mono text-xs text-zinc-200">{`7 3\n5 1 9 3 4 8 2\n1 4\n2 7\n3 6`}</pre>
                    </CardContent>
                  </Card>
                  <Card className="border-dashed border-zinc-700 bg-zinc-900/70">
                    <CardContent className="space-y-1 px-3 py-3 text-sm text-zinc-300">
                      <p className="text-zinc-400">Output</p>
                      <pre className="font-mono text-xs text-zinc-200">{`18\n27\n24`}</pre>
                      <p className="text-xs text-emerald-300">All assertions passed</p>
                    </CardContent>
                  </Card>
                  <div className="grid gap-2 sm:grid-cols-2">
                    <Button
                      size="sm"
                      className="h-9 border border-dashed border-zinc-600 bg-zinc-900 text-xs text-zinc-100 hover:bg-zinc-800"
                    >
                      Run Tests
                    </Button>
                    <Button
                      size="sm"
                      className="h-9 border border-[#ff4f00]/80 bg-[#ff4f00] text-xs text-white hover:bg-[#e64700]"
                    >
                      Submit Main
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
