"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Terminal } from "lucide-react";

type HandleInputProps = {
  initialValue?: string;
};

export default function HandleInput({ initialValue = "" }: HandleInputProps) {
  const [handle, setHandle] = useState(initialValue);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedHandle = handle.trim();
    if (!trimmedHandle) return;

    setIsLoading(true);
    router.push(`/${encodeURIComponent(trimmedHandle)}`);
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-sm mx-auto group relative">
      <div className="relative flex items-center p-1 bg-[#111] border border-zinc-800 shadow-[4px_4px_0px_0px_rgba(39,39,42,0.5)] transition-all focus-within:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.2)] focus-within:border-zinc-600">
        <div className="pointer-events-none absolute inset-0 opacity-[0.03] bg-[repeating-linear-gradient(45deg,#fff_0px,#fff_1px,transparent_1px,transparent_4px)]" />

        <div className="pl-3 pr-2 text-zinc-500">
          <Terminal className="w-5 h-5" />
        </div>

        <input
          type="text"
          value={handle}
          onChange={(e) => setHandle(e.target.value)}
          placeholder="handle"
          className="flex-1 bg-transparent border-none text-zinc-100 placeholder:text-zinc-700 focus:ring-0 focus:outline-none font-[family-name:var(--font-geist-mono)] text-base md:text-sm h-10 w-full min-w-0"
          autoFocus
        />

        <button
          type="submit"
          disabled={!handle.trim() || isLoading}
          className="ml-2 px-4 h-8 bg-zinc-200 hover:bg-white text-black font-[family-name:var(--font-geist-pixel-square)] text-xs uppercase tracking-widest disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center min-w-[80px]"
        >
          {isLoading ? <Loader2 className="h-3 w-3 animate-spin" /> : "Fetch"}
        </button>
      </div>
    </form>
  );
}
