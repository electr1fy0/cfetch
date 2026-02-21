"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

const handlePattern = /^[a-zA-Z0-9_\-.]{3,24}$/;

export function GetStartedFlow() {
  const [handle, setHandle] = useState("");
  const router = useRouter();

  const handleIsValid = useMemo(() => handlePattern.test(handle), [handle]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!handleIsValid) return;
    router.push(`/analytics?handle=${encodeURIComponent(handle)}`);
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex w-full max-w-lg flex-col gap-2 sm:flex-row"
    >
      <input
        value={handle}
        onChange={(e) => setHandle(e.target.value.trim())}
        aria-label="Codeforces handle"
        placeholder="Enter Codeforces handle"
        className="h-11 flex-1 rounded-md border border-dashed border-zinc-600 bg-zinc-950 px-4 text-sm text-zinc-200 placeholder:text-zinc-500 focus:border-zinc-500 focus:outline-none"
      />
      <Button
        type="submit"
        disabled={!handleIsValid}
        className="h-11 rounded-md border border-zinc-500 bg-zinc-100 px-4 text-xs uppercase tracking-[0.2em] text-zinc-900 transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-60"
      >
        View Analytics
      </Button>
    </form>
  );
}