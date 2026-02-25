import { redirect } from "next/navigation";
import { AnalyticsDashboard } from "@/components/analytics-dashboard";
import { loadAnalytics } from "@/lib/codeforces";
import HandleInput from "@/components/handle-input";

type Props = {
  params: Promise<{ handle: string }>;
};

export default async function Page(props: Props) {
  const { handle } = await props.params;
  const queryHandle = decodeURIComponent(handle).trim();

  if (!queryHandle) {
    redirect("/landing");
  }

  try {
    const model = await loadAnalytics(queryHandle);
    return (
      <div className="">
        <AnalyticsDashboard data={model} />
      </div>
    );
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to load analytics";
    return (
      <div className="min-h-screen bg-[#070707] flex flex-col items-center justify-center p-6 text-zinc-100">
        <div className="w-full max-w-md space-y-6">
          <div className="rounded-xl border border-red-900/40 bg-red-950/10 p-4 text-sm text-red-200 text-center">
            <p className="font-semibold mb-1">Could not load profile</p>
            <p className="opacity-80">{message}</p>
          </div>
          
          <div className="bg-[#171717] p-6 rounded-xl border border-zinc-800 shadow-xl">
             <h2 className="text-lg font-medium text-center mb-4 text-zinc-300">Try another handle</h2>
             <HandleInput />
          </div>
          
          <div className="text-center">
            <a href="/landing" className="text-sm text-zinc-500 hover:text-zinc-300 transition-colors">
              &larr; Back to Home
            </a>
          </div>
        </div>
      </div>
    );
  }
}
