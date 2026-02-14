import { getUserRating } from "@/lib/codeforces";
import { PingingDotChart } from "@/components/ui/pinging-dot-chart";

export default async function Page() {
  let chartData: { label: string; rating: number }[] = [];
  let hasError = false;

  try {
    const data = await getUserRating("electr1fy0");
    chartData = data.map(
      (row: {
        contestId: number;
        newRating: number;
      }) => ({
        label: `#${row.contestId}`,
        rating: row.newRating,
      }),
    );
  } catch {
    hasError = true;
  }

  return (
    <div className="min-h-screen bg-stone-950 p-4 text-stone-100 sm:p-6">
      <div className="w-full">
        {hasError ? (
          <div className="rounded-xl border border-stone-800 bg-stone-900/70 p-4 text-sm text-stone-400">
            Failed to load analytics.
          </div>
        ) : (
          <PingingDotChart
            data={chartData}
            description="Contest-by-contest rating updates"
          />
        )}
      </div>
    </div>
  );
}
