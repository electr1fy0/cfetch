import HandleInput from "@/components/handle-input";

export default function LandingPage() {
  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center bg-[#070707] text-zinc-100 overflow-hidden pb-20">
      <div className="pointer-events-none absolute inset-0 bg-[repeating-linear-gradient(-45deg,rgba(255,255,255,0.07)_0px,rgba(255,255,255,0.07)_1px,transparent_1px,transparent_7px)]" />
      
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[600px] bg-zinc-500/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="relative z-10 w-full max-w-4xl px-6 flex flex-col items-center text-center space-y-16">
        
        <div className="space-y-24">
          <h1 className="font-[family-name:var(--font-geist-pixel-triangle)] text-2xl md:text-3xl font-bold tracking-tight text-white drop-shadow-sm opacity-50">
            cfetch
          </h1>
          <p className="font-[family-name:var(--font-geist-pixel-square)] text-4xl md:text-6xl font-bold text-zinc-400 max-w-4xl mx-auto leading-[0.9] tracking-tighter">
            Codeforces analytics. <br />
            <span className="text-zinc-100">Visualized.</span>
          </p>
        </div>

        <div className="w-full max-w-md">
            <HandleInput />
        </div>
      </div>
    </div>
  );
}
