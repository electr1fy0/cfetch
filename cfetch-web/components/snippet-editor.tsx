"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { codeToHtml } from "shiki";
import { cn } from "@/lib/utils";

const LANGS = [
  "plaintext",
  "javascript",
  "typescript",
  "tsx",
  "jsx",
  "json",
  "cpp",
  "c",
  "rust",
  "python",
  "java",
  "go",
] as const;

function escapeHtml(code: string) {
  return code
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

export function SnippetEditor({ className }: { className?: string }) {
  const [content, setContent] = useState("");
  const [language, setLanguage] = useState<(typeof LANGS)[number]>("typescript");
  const [highlighted, setHighlighted] = useState<string>("");
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const highlightRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      try {
        const html = await codeToHtml(content || "// Start typing your snippet", {
          lang: language,
          theme: "github-dark-dimmed",
        });
        if (!cancelled) setHighlighted(html);
      } catch {
        if (!cancelled) {
          setHighlighted(
            `<pre><code>${escapeHtml(content || "// Start typing your snippet")}</code></pre>`,
          );
        }
      }
    };

    run();
    return () => {
      cancelled = true;
    };
  }, [content, language]);

  const count = useMemo(() => content.length, [content]);

  const syncScroll = () => {
    if (!textareaRef.current || !highlightRef.current) return;
    highlightRef.current.scrollTop = textareaRef.current.scrollTop;
    highlightRef.current.scrollLeft = textareaRef.current.scrollLeft;
  };

  const handleKeyDown: React.KeyboardEventHandler<HTMLTextAreaElement> = (e) => {
    if (e.key !== "Tab") return;
    e.preventDefault();

    const textarea = e.currentTarget;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const tab = "  ";
    const next = `${content.slice(0, start)}${tab}${content.slice(end)}`;

    setContent(next);

    requestAnimationFrame(() => {
      if (!textareaRef.current) return;
      const pos = start + tab.length;
      textareaRef.current.selectionStart = pos;
      textareaRef.current.selectionEnd = pos;
    });
  };

  return (
    <div className={cn("grid gap-3", className)}>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
        <label className="flex flex-col gap-1 text-xs text-stone-400">
          <span className="font-mono uppercase tracking-wide">Language</span>
          <select
            name="language"
            value={language}
            onChange={(e) => setLanguage(e.target.value as (typeof LANGS)[number])}
            className="h-9 rounded-md border border-stone-700 bg-stone-950 px-2 text-sm text-stone-200"
          >
            {LANGS.map((lang) => (
              <option key={lang} value={lang}>
                {lang}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1 text-xs text-stone-400">
          <span className="font-mono uppercase tracking-wide">Complexity</span>
          <input
            name="complexity"
            placeholder="O(n log n)"
            className="h-9 rounded-md border border-stone-700 bg-stone-950 px-2 text-sm text-stone-200"
          />
        </label>
        <label className="col-span-2 flex flex-col gap-1 text-xs text-stone-400 md:col-span-1">
          <span className="font-mono uppercase tracking-wide">Difficulty</span>
          <input
            name="difficulty"
            placeholder="1400"
            className="h-9 rounded-md border border-stone-700 bg-stone-950 px-2 text-sm text-stone-200"
          />
        </label>
      </div>

      <label className="flex flex-col gap-1 text-xs text-stone-400">
        <span className="font-mono uppercase tracking-wide">Snippet</span>
        <div className="relative overflow-hidden rounded-md border border-stone-700 bg-stone-950">
          <div
            ref={highlightRef}
            aria-hidden
            className="pointer-events-none absolute inset-0 overflow-hidden p-3 [&_.shiki]:!bg-transparent [&_pre]:!m-0 [&_pre]:!bg-transparent [&_pre]:min-w-max [&_pre]:whitespace-pre [&_pre]:text-xs [&_pre]:leading-5"
            dangerouslySetInnerHTML={{ __html: highlighted }}
          />
          <textarea
            ref={textareaRef}
            name="content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onKeyDown={handleKeyDown}
            onScroll={syncScroll}
            placeholder="Paste or write code..."
            rows={11}
            className="relative z-10 block w-full resize-y bg-transparent p-3 font-mono text-xs leading-5 text-transparent caret-stone-200 selection:bg-stone-700/50 focus:outline-none"
            spellCheck={false}
            required
          />
        </div>
      </label>

      <div className="text-[11px] font-mono uppercase tracking-wide text-stone-500">
        {count} chars
      </div>

    </div>
  );
}
