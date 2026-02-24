"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ArrowRight, Loader2 } from "lucide-react";

export default function HandleInput() {
  const [handle, setHandle] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (handle.trim()) {
      setIsLoading(true);
      router.push(`/analytics?handle=${encodeURIComponent(handle.trim())}`);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 w-full">
      <div className="space-y-2">
        <label htmlFor="handle" className="sr-only">Codeforces Handle</label>
        <Input
          id="handle"
          type="text"
          placeholder="Enter Codeforces handle..."
          value={handle}
          onChange={(e) => setHandle(e.target.value)}
          className="bg-[#171717] border-zinc-700/50 text-zinc-100 placeholder:text-zinc-500 h-12 text-base focus-visible:ring-zinc-600 focus-visible:border-zinc-500 transition-all"
          autoFocus
        />
      </div>
      <Button
        type="submit"
        className="w-full bg-zinc-100 text-zinc-950 hover:bg-white h-11 font-medium text-base shadow-lg shadow-zinc-900/20 transition-all active:scale-[0.98]"
        disabled={!handle.trim() || isLoading}
      >
        {isLoading ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <>
            Analyze Profile <ArrowRight className="ml-2 h-4 w-4 opacity-70" />
          </>
        )}
      </Button>
    </form>
  );
}