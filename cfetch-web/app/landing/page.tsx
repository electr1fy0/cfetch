import HandleInput from "@/components/handle-input";

export default function LandingPage() {
  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center bg-[#070707] text-zinc-100 overflow-hidden pb-20">
      {/* Background Pattern */}
      <div className="pointer-events-none absolute inset-0 bg-[repeating-linear-gradient(-45deg,rgba(255,255,255,0.02)_0px,rgba(255,255,255,0.02)_1px,transparent_1px,transparent_7px)]" />
      
      {/* Glow Effect */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-zinc-800/20 rounded-full blur-[100px] pointer-events-none" />

      <div className="relative z-10 w-full max-w-2xl px-6 py-12 flex flex-col items-center text-center space-y-12">
        
        {/* Header / Logo */}
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-700">
          <h1 className="font-[family-name:var(--font-geist-pixel-square)] text-6xl md:text-9xl font-bold tracking-tight text-white drop-shadow-sm">
            cfetch
          </h1>
          <p className="text-xl md:text-2xl text-zinc-400 max-w-2xl mx-auto leading-relaxed">
            Elevate your competitive programming journey. <br className="hidden sm:block" />
            Uncover insights, track growth, and optimize your strategy with precision analytics.
          </p>
        </div>

        {/* Input Section */}
        <div className="w-full max-w-md animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-150">
          <div className="p-1 rounded-xl bg-gradient-to-b from-zinc-700/50 to-zinc-900/50 p-[1px]">
             <div className="bg-[#0a0a0a] rounded-[10px] p-6 border border-zinc-800/50 shadow-2xl">
                <HandleInput />
             </div>
          </div>
        </div>

        {/* Footer / Features simplified */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 w-full max-w-3xl text-center pt-12 animate-in fade-in slide-in-from-bottom-6 duration-1000 delay-300">
           <div className="group space-y-2 p-4 rounded-xl transition-colors hover:bg-zinc-900/30">
             <div className="text-3xl font-bold text-zinc-200 group-hover:text-white transition-colors">Stats</div>
             <div className="text-xs text-zinc-500 uppercase tracking-[0.2em] font-medium group-hover:text-zinc-400 transition-colors">Deep Dive</div>
           </div>
           <div className="group space-y-2 p-4 rounded-xl transition-colors hover:bg-zinc-900/30">
             <div className="text-3xl font-bold text-zinc-200 group-hover:text-white transition-colors">Graphs</div>
             <div className="text-xs text-zinc-500 uppercase tracking-[0.2em] font-medium group-hover:text-zinc-400 transition-colors">Visualized</div>
           </div>
           <div className="group space-y-2 p-4 rounded-xl transition-colors hover:bg-zinc-900/30">
             <div className="text-3xl font-bold text-zinc-200 group-hover:text-white transition-colors">No Login</div>
             <div className="text-xs text-zinc-500 uppercase tracking-[0.2em] font-medium group-hover:text-zinc-400 transition-colors">Required</div>
           </div>
        </div>
      </div>
      
      <div className="absolute bottom-6 text-zinc-600 text-sm">
        Built for competitive programmers.
      </div>
    </div>
  );
}
