import HandleInput from "@/components/handle-input";

export default function LandingPage() {
  return (
    <div className="relative min-h-screen flex flex-col items-center justify-start bg-[#070707] text-zinc-100 overflow-hidden pb-20 pt-16 md:pt-24">
      {/* Background Pattern */}
      <div className="pointer-events-none absolute inset-0 bg-[repeating-linear-gradient(-45deg,rgba(255,255,255,0.02)_0px,rgba(255,255,255,0.02)_1px,transparent_1px,transparent_7px)]" />
      
      {/* Glow Effect */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-zinc-800/20 rounded-full blur-[100px] pointer-events-none" />

      <div className="relative z-10 w-full max-w-4xl px-6 flex flex-col items-center text-center space-y-16">
        
        {/* Header / Logo */}
        <div className="space-y-24">
          <h1 className="font-[family-name:var(--font-geist-pixel-triangle)] text-2xl md:text-3xl font-bold tracking-tight text-white drop-shadow-sm opacity-50">
            cfetch
          </h1>
          <p className="font-[family-name:var(--font-geist-pixel-square)] text-3xl md:text-5xl font-medium text-zinc-400 max-w-3xl mx-auto leading-tight">
            Codeforces analytics. <span className="text-zinc-100">Visualized.</span>
          </p>
        </div>

        {/* Input Section */}
        <div className="w-full max-w-md">
          <div className="p-1 rounded-xl bg-gradient-to-b from-zinc-700/50 to-zinc-900/50 p-[1px]">
             <div className="bg-[#0a0a0a] rounded-[10px] p-6 border border-zinc-800/50 shadow-2xl">
                <HandleInput />
             </div>
          </div>
        </div>
      </div>
      
      <div className="absolute bottom-6 text-zinc-600 text-sm">
        Built for competitive programmers.
      </div>
    </div>
  );
}
