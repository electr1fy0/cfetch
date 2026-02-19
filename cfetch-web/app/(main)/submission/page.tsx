"use client";

import { useMemo, useState } from "react";
import { Editor } from "@monaco-editor/react";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  CodeIcon,
  LayoutIcon,
  SettingsIcon,
  FloppyDiskIcon,
} from "@hugeicons/core-free-icons";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const starterCodeByLanguage: Record<string, string> = {
  cpp: `class Solution {
public:
  int lengthOfLongestSubstring(string s) {
    // write your solution
    return 0;
  }
};`,
  python: `class Solution:
    def lengthOfLongestSubstring(self, s: str) -> int:
        # write your solution
        return 0`,
  javascript: `class Solution {
  lengthOfLongestSubstring(s) {
    // write your solution
    return 0;
  }
}`,
};

const languageLabels: Record<string, string> = {
  cpp: "C++",
  python: "Python",
  javascript: "JavaScript",
};

type ProblemTab = "description" | "editorial" | "solutions" | "submissions";

export default function Submission() {
  const [language, setLanguage] = useState("cpp");
  const [code, setCode] = useState(starterCodeByLanguage.cpp);
  const [activeTab, setActiveTab] = useState<ProblemTab>("description");

  const tabContent = useMemo(() => {
    if (activeTab !== "description") {
      return (
        <div className="flex h-full items-center justify-center rounded-xl border border-white/10 bg-[#161a20] text-sm text-zinc-400">
          {activeTab[0].toUpperCase() + activeTab.slice(1)} panel coming next.
        </div>
      );
    }

    return (
      <div className="space-y-7 text-zinc-200">
        <div className="space-y-3">
          <h1 className="text-2xl font-semibold tracking-tight md:text-[26px]">
            3. Longest Substring Without Repeating Characters
          </h1>
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="outline" className="border-white/15 text-zinc-300">
              Medium
            </Badge>
            <Badge variant="outline" className="border-white/15 text-zinc-300">
              Topics
            </Badge>
            <Badge variant="outline" className="border-white/15 text-zinc-300">
              Companies
            </Badge>
            <Badge variant="outline" className="border-white/15 text-zinc-300">
              Hint
            </Badge>
          </div>
        </div>

        <p className="max-w-3xl text-[15px] leading-7 text-zinc-300">
          Given a string{" "}
          <code className="rounded bg-white/10 px-1.5 py-0.5">s</code>, find the
          length of the longest substring without duplicate characters.
        </p>

        <section className="space-y-4">
          <h2 className="text-lg font-semibold">Example 1:</h2>
          <div className="rounded-xl border border-white/10 bg-[#161a20] p-4 font-mono text-sm leading-7 text-zinc-300">
            <p>
              <span className="font-bold text-zinc-100">Input:</span> s =
              &quot;abcabcbb&quot;
            </p>
            <p>
              <span className="font-bold text-zinc-100">Output:</span> 3
            </p>
            <p>
              <span className="font-bold text-zinc-100">Explanation:</span> The
              answer is &quot;abc&quot;, with length 3.
            </p>
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-lg font-semibold">Example 2:</h2>
          <div className="rounded-xl border border-white/10 bg-[#161a20] p-4 font-mono text-sm leading-7 text-zinc-300">
            <p>
              <span className="font-bold text-zinc-100">Input:</span> s =
              &quot;bbbbb&quot;
            </p>
            <p>
              <span className="font-bold text-zinc-100">Output:</span> 1
            </p>
          </div>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold">Constraints:</h2>
          <ul className="space-y-2 text-sm text-zinc-300">
            <li>1 &lt;= s.length &lt;= 5 * 10^4</li>
            <li>s consists of English letters, digits, symbols and spaces.</li>
          </ul>
        </section>
      </div>
    );
  }, [activeTab]);

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
        { token: "delimiter", foreground: "ABB2BF" },
      ],
      colors: {
        "editor.background": "#1b1d23",
        "editor.foreground": "#ABB2BF",
        "editorLineNumber.foreground": "#4B5263",
        "editorCursor.foreground": "#D19A66",
        "editor.selectionBackground": "#3E4451",
        "editor.inactiveSelectionBackground": "#353B45",
        "editorLineNumber.activeForeground": "#ABB2BF",
        "editorIndentGuide.background1": "#3B4048",
        "editorWhitespace.foreground": "#3B4048",
      },
    });
  }

  function handleLanguageChange(nextLanguage: string) {
    setLanguage(nextLanguage);
    setCode(starterCodeByLanguage[nextLanguage] ?? "");
  }

  const problemTabs: ProblemTab[] = [
    "description",
    "editorial",
    "solutions",
    "submissions",
  ];

  return (
    <main className="h-[calc(100vh-1.5rem)] bg-[#171717] p-2 text-zinc-100 md:p-3">
      <div className="flex h-full min-h-0 flex-col gap-2">
        <header className="flex items-center justify-between rounded-xl border border-white/10 bg-neutral-900 px-3 py-2.5">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="h-7 border-white/15 bg-white/5 text-xs text-zinc-200 hover:bg-white/10"
            >
              <HugeiconsIcon icon={LayoutIcon} strokeWidth={2} />
              Problems
            </Button>
            <span className="text-xs font-medium text-zinc-400">
              NeetCode 150
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="h-7 border-white/15 bg-white/5 text-xs text-zinc-200 hover:bg-white/10"
            >
              Run
            </Button>
            <Button
              size="sm"
              className="h-7 bg-zinc-200 text-zinc-950 hover:bg-zinc-100 text-xs"
            >
              Submit
            </Button>
          </div>
        </header>

        <section className="grid min-h-0 flex-1 gap-2 xl:grid-cols-[1fr_1fr]">
          <div className="flex min-h-0 flex-col rounded-xl border border-white/10 bg-neutral-900">
            <div className="flex items-center gap-1 overflow-x-auto border-b border-white/10 px-2 py-2">
              {problemTabs.map((tab) => {
                const isActive = tab === activeTab;
                return (
                  <Button
                    key={tab}
                    variant="ghost"
                    size="sm"
                    className={
                      isActive
                        ? "h-7 bg-white/10 text-xs text-zinc-100"
                        : "h-7 text-xs text-zinc-400 hover:bg-white/5 hover:text-zinc-200"
                    }
                    onClick={() => setActiveTab(tab)}
                  >
                    {tab[0].toUpperCase() + tab.slice(1)}
                  </Button>
                );
              })}
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto p-4 md:p-5">
              {tabContent}
            </div>
          </div>

          <div className="flex min-h-0 flex-col rounded-xl border border-white/10 bg-[#11141b]">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 px-3 py-2.5">
              <div className="flex items-center gap-2">
                <HugeiconsIcon
                  icon={CodeIcon}
                  strokeWidth={2}
                  className="text-zinc-300"
                />
                <span className="text-sm font-semibold tracking-wide text-zinc-200">
                  Code
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Select value={language} onValueChange={handleLanguageChange}>
                  <SelectTrigger className="h-7 w-[120px] border-white/15 bg-white/5 text-xs text-zinc-100">
                    <SelectValue placeholder="Language" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cpp">C++</SelectItem>
                    <SelectItem value="python">Python</SelectItem>
                    <SelectItem value="javascript">JavaScript</SelectItem>
                  </SelectContent>
                </Select>
                <Badge
                  variant="outline"
                  className="border-white/15 text-zinc-300"
                >
                  {languageLabels[language]}
                </Badge>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  className="h-7 w-7 text-zinc-300 hover:bg-white/10"
                >
                  <HugeiconsIcon icon={SettingsIcon} strokeWidth={2} />
                </Button>
              </div>
            </div>

            <div className="min-h-0 flex-1">
              <Editor
                theme="cfetch-one-dark"
                language={language}
                value={code}
                beforeMount={defineTheme}
                onChange={(value) => setCode(value || "")}
                options={{
                  fontSize: 14,
                  fontLigatures: true,
                  minimap: { enabled: false },
                  scrollBeyondLastLine: false,
                  lineNumbersMinChars: 3,
                  renderLineHighlight: "all",
                  wordWrap: "off",
                  padding: { top: 16, bottom: 16 },
                }}
              />
            </div>

            <Separator className="bg-white/10" />

            <div className="flex items-center justify-between px-3 py-2">
              <span className="text-xs text-zinc-400">Saved</span>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-7 border-white/15 bg-transparent text-xs text-zinc-200 hover:bg-white/10"
                >
                  <HugeiconsIcon icon={FloppyDiskIcon} strokeWidth={2} />
                  Save Draft
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-7 border-white/15 bg-transparent text-xs text-zinc-200 hover:bg-white/10"
                >
                  Run
                </Button>
                <Button
                  size="sm"
                  className="h-7 bg-zinc-200 text-xs text-zinc-950 hover:bg-zinc-100"
                >
                  Submit
                </Button>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
