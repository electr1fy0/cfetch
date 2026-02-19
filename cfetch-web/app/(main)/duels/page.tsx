"use client";

import { useEffect, useMemo, useState } from "react";
import { Editor } from "@monaco-editor/react";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Clock01Icon,
  CodeIcon,
  ViewIcon,
} from "@hugeicons/core-free-icons";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type ProblemState = "live" | "won_you" | "won_opp" | "pending";

type DuelProblem = {
  id: string;
  title: string;
  difficulty: "Easy" | "Medium" | "Hard";
  state: ProblemState;
  description: string;
  examples: Array<{ input: string; output: string; note?: string }>;
  testsPassed: { you: number; opp: number; total: number };
};

const problems: DuelProblem[] = [
  {
    id: "P1",
    title: "Longest Substring Without Repeating Characters",
    difficulty: "Medium",
    state: "live",
    description:
      "Given a string s, return the length of the longest substring without repeating characters.",
    examples: [
      { input: 's = "abcabcbb"', output: "3", note: 'Longest is "abc".' },
      { input: 's = "bbbbb"', output: "1" },
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
    description: "Merge overlapping intervals and return the minimal set of non-overlapping intervals.",
    examples: [{ input: "intervals = [[1,3],[2,6],[8,10],[15,18]]", output: "[[1,6],[8,10],[15,18]]" }],
    testsPassed: { you: 0, opp: 0, total: 22 },
  },
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

function ProgressBar({
  label,
  passed,
  total,
  active,
}: {
  label: string;
  passed: number;
  total: number;
  active?: boolean;
}) {
  const pct = Math.round((passed / total) * 100);
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-xs text-zinc-400">
        <span>{label}</span>
        <span className="font-mono text-zinc-300">
          {passed}/{total}
        </span>
      </div>
      <div className="h-2.5 overflow-hidden rounded-full bg-zinc-800">
        <div
          className={active ? "h-full rounded-full bg-orange-500" : "h-full rounded-full bg-zinc-500"}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

function stateLabel(state: ProblemState) {
  if (state === "won_you") return "Won";
  if (state === "won_opp") return "Lost";
  if (state === "live") return "Live";
  return "Queued";
}

export default function DuelsPage() {
  const [activeProblemId, setActiveProblemId] = useState("P1");
  const [code, setCode] = useState(starterCode);
  const [peekLeft, setPeekLeft] = useState(2);
  const [peekTimer, setPeekTimer] = useState(0);

  const activeProblem = problems.find((p) => p.id === activeProblemId) ?? problems[0];

  const summary = useMemo(() => {
    const base = {
      youTests: 0,
      oppTests: 0,
      totalTests: 0,
      youWins: 0,
      oppWins: 0,
    };

    for (const problem of problems) {
      base.youTests += problem.testsPassed.you;
      base.oppTests += problem.testsPassed.opp;
      base.totalTests += problem.testsPassed.total;
      if (problem.state === "won_you") base.youWins += 1;
      if (problem.state === "won_opp") base.oppWins += 1;
    }

    return base;
  }, []);

  useEffect(() => {
    if (peekTimer <= 0) return;
    const id = setInterval(() => setPeekTimer((v) => (v <= 1 ? 0 : v - 1)), 1000);
    return () => clearInterval(id);
  }, [peekTimer]);

  function handlePeek() {
    if (peekLeft <= 0 || peekTimer > 0) return;
    setPeekLeft((v) => v - 1);
    setPeekTimer(5);
  }

  function defineTheme(monaco: any) {
    monaco.editor.defineTheme("cfetch-one-dark", {
      base: "vs-dark",
      inherit: true,
      rules: [
        { token: "keyword", foreground: "C678DD" },
        { token: "string", foreground: "98C379" },
        { token: "number", foreground: "D19A66" },
        { token: "comment", foreground: "5C6370", fontStyle: "italic" },
        { token: "function", foreground: "61AFEF" },
        { token: "type", foreground: "E5C07B" },
      ],
      colors: {
        "editor.background": "#121315",
        "editor.foreground": "#ABB2BF",
        "editorLineNumber.foreground": "#4B5263",
        "editorCursor.foreground": "#D19A66",
        "editor.selectionBackground": "#303644",
      },
    });
  }

  return (
    <main className="min-h-screen bg-[#0a0a0b] text-zinc-100">
      <div className="border-b border-zinc-800 bg-[#111112]">
        <div className="mx-auto flex w-full max-w-[1540px] flex-wrap items-center justify-between gap-2 px-4 py-3 md:px-6">
          <div className="flex items-center gap-3">
            <p className="text-lg font-semibold tracking-tight">Duels</p>
            <Badge variant="outline" className="border-zinc-700 text-zinc-300">
              Match #8421
            </Badge>
            <p className="text-xs text-zinc-500">Best of 3 • 12:42 remaining</p>
          </div>

          <div className="flex items-center gap-2">
            <Select value={activeProblem.id} onValueChange={setActiveProblemId}>
              <SelectTrigger className="h-8 w-[220px] border-zinc-700 bg-zinc-900 text-xs text-zinc-200">
                <SelectValue placeholder="Select problem" />
              </SelectTrigger>
              <SelectContent>
                {problems.map((problem) => (
                  <SelectItem key={problem.id} value={problem.id}>
                    {problem.id}: {problem.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button
              size="sm"
              className="h-8 border border-zinc-600 bg-gradient-to-b from-zinc-800 to-zinc-900 text-xs text-zinc-100 hover:from-zinc-700 hover:to-zinc-800"
            >
              Run
            </Button>
            <Button
              size="sm"
              className="h-8 border border-orange-600 bg-gradient-to-b from-orange-600 to-orange-800 text-xs font-medium text-white hover:from-orange-500 hover:to-orange-700"
            >
              Submit
            </Button>
          </div>
        </div>
      </div>

      <div className="mx-auto flex w-full max-w-[1540px] flex-col gap-4 px-4 py-4 md:px-6">
        <Card className="border-zinc-800 bg-[#111213]">
          <CardContent className="space-y-3 pt-4">
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
              <div className="flex items-center gap-2 text-zinc-300">
                <span className="rounded border border-zinc-700 bg-zinc-900 px-2 py-1">
                  Score: You {summary.youWins} - {summary.oppWins} Opponent
                </span>
                <span className="rounded border border-zinc-700 bg-zinc-900 px-2 py-1">
                  Active: {activeProblem.id} / {problems.length}
                </span>
              </div>
              <span className="text-zinc-500">Overall duel progress</span>
            </div>

            <ProgressBar
              label="Your total passed tests"
              passed={summary.youTests}
              total={summary.totalTests}
            />
            <ProgressBar
              label="Opponent total passed tests"
              passed={summary.oppTests}
              total={summary.totalTests}
              active={summary.oppTests > summary.youTests}
            />

            <div className="flex flex-wrap items-center gap-2 pt-1">
              {problems.map((problem) => (
                <div
                  key={problem.id}
                  className={`rounded border px-2 py-1 text-[11px] ${
                    problem.id === activeProblem.id
                      ? "border-orange-600 bg-zinc-900 text-zinc-100"
                      : "border-zinc-700 bg-zinc-900 text-zinc-400"
                  }`}
                >
                  {problem.id} • {stateLabel(problem.state)}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <section className="grid gap-4 xl:grid-cols-[1.02fr_1.18fr]">
          <Card className="border-zinc-800 bg-[#111213]">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between gap-2">
                <div>
                  <CardTitle className="text-base">{activeProblem.title}</CardTitle>
                  <p className="mt-1 text-xs text-zinc-500">Problem {activeProblem.id}</p>
                </div>
                <Badge variant="outline" className="border-zinc-700 text-zinc-300">
                  {activeProblem.difficulty}
                </Badge>
              </div>
            </CardHeader>

            <CardContent className="space-y-4 text-sm">
              <p className="text-zinc-300">{activeProblem.description}</p>

              <div className="space-y-2 rounded-lg border border-zinc-800 bg-zinc-900 p-3">
                <p className="text-xs uppercase tracking-wide text-zinc-500">Examples</p>
                {activeProblem.examples.map((example, idx) => (
                  <div key={`${activeProblem.id}-${idx}`} className="font-mono text-xs text-zinc-300">
                    <p>Input: {example.input}</p>
                    <p>Output: {example.output}</p>
                    {example.note ? <p>Note: {example.note}</p> : null}
                  </div>
                ))}
              </div>

              <div className="space-y-2 rounded-lg border border-zinc-800 bg-zinc-900 p-3">
                <p className="text-xs uppercase tracking-wide text-zinc-500">Live Tests</p>
                <div className="text-xs text-zinc-300">
                  <p>Case 01: Pass</p>
                  <p>Case 02: Pass</p>
                  <p>Case 03: Fail (boundary condition)</p>
                  <p>Case 04: Running...</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-zinc-800 bg-[#111213]">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between gap-2">
                <CardTitle className="text-sm">Code Editor</CardTitle>
                <div className="flex items-center gap-2 text-xs text-zinc-500">
                  <HugeiconsIcon icon={Clock01Icon} strokeWidth={2} />
                  last save 4s ago
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-3">
              <div className="h-[68vh] min-h-[520px] overflow-hidden rounded-lg border border-zinc-800">
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

              <div className="grid gap-3 md:grid-cols-[1fr_auto]">
                <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-2.5 text-xs text-zinc-400">
                  <div className="mb-1 flex items-center gap-2 text-zinc-500">
                    <HugeiconsIcon icon={CodeIcon} strokeWidth={2} />
                    Opponent activity
                  </div>
                  <p>[12:01] Compile success</p>
                  <p>[12:04] P1 Case 05 failed</p>
                  <p>[12:07] P1 Passed 21/25</p>
                </div>

                <div className="flex flex-col gap-2">
                  <Button
                    size="sm"
                    className="h-8 border border-zinc-600 bg-gradient-to-b from-zinc-800 to-zinc-900 text-xs text-zinc-100 hover:from-zinc-700 hover:to-zinc-800"
                  >
                    Run custom input
                  </Button>
                  <Button
                    onClick={handlePeek}
                    disabled={peekLeft <= 0 || peekTimer > 0}
                    size="sm"
                    className="h-8 border border-orange-600 bg-gradient-to-b from-orange-600 to-orange-800 text-xs text-white hover:from-orange-500 hover:to-orange-700"
                  >
                    <HugeiconsIcon icon={ViewIcon} strokeWidth={2} />
                    Peek • {peekLeft} left
                  </Button>
                </div>
              </div>

              {peekTimer > 0 ? (
                <div className="rounded-md border border-orange-700 bg-[#2a1609] p-2 text-[11px] text-orange-200">
                  <p>Peek active for {peekTimer}s</p>
                  <pre className="mt-1 overflow-x-auto text-orange-100">{`unordered_map<char,int> m;
if (m.count(s[r])) left = ...;
ans = max(ans, r - left + 1);`}</pre>
                </div>
              ) : null}
            </CardContent>
          </Card>
        </section>
      </div>
    </main>
  );
}
