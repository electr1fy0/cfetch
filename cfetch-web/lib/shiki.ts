import { createHighlighter } from "shiki";

const SHIKI_THEME = "github-dark-dimmed";
const SHIKI_LANGUAGES = [
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

let highlighterPromise: ReturnType<typeof createHighlighter> | null = null;

export function getShiki() {
  if (!highlighterPromise) {
    highlighterPromise = createHighlighter({
      themes: [SHIKI_THEME],
      langs: [...SHIKI_LANGUAGES],
    });
  }

  return highlighterPromise;
}

export const defaultShikiTheme = SHIKI_THEME;
