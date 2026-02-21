import { auth } from "@/auth";
import { AnalyticsDashboard } from "@/components/analytics-dashboard";
import { GoogleSignInButton } from "@/components/google-signin-button";
import { loadAnalytics } from "@/lib/codeforces";

type Props = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export default async function Page(props: Props) {
  const searchParams = await props.searchParams;
  const session = await auth();
  const sessionHandle = session?.user?.name?.trim();
  const queryHandle =
    typeof searchParams.handle === "string" ? searchParams.handle.trim() : null;

  const handle = queryHandle || sessionHandle;
  const isPublicView = !!queryHandle && queryHandle !== sessionHandle;
  const showSignIn = isPublicView && !session;

  if (!handle) {
    return (
      <div className="min-h-screen bg-[#070707] p-6 text-zinc-100">
        <div className="rounded-xl border border-zinc-800 bg-[#171717] p-4 text-sm text-zinc-300">
          No Codeforces handle is locked for this account yet. Sign in from
          landing and complete handle setup first.
        </div>
      </div>
    );
  }

  try {
    const model = await loadAnalytics(handle);
    return (
      <>
        {showSignIn && (
          <header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between border-b border-zinc-800 bg-[#070707] px-6 py-3">
            <div className="flex items-center gap-2">
              <span className="font-[family-name:var(--font-geist-pixel-triangle)] text-lg font-bold text-zinc-100">
                cfetch
              </span>
            </div>
            <form
              action={async () => {
                "use server";
                await import("@/auth").then((m) => m.signIn("google"));
              }}
            >
              <GoogleSignInButton
                text="Sign In"
                className="bg-zinc-100 px-3 py-1.5 text-xs text-zinc-900 hover:bg-white"
              />
            </form>
          </header>
        )}
        <div className={showSignIn ? "pt-16" : ""}>
          <AnalyticsDashboard data={model} />
        </div>
        {showSignIn && (
          <div className="mx-auto w-full max-w-3xl px-4 py-32">
            <div className="relative overflow-hidden rounded-3xl border border-zinc-800 bg-gradient-to-b from-zinc-900/50 to-[#171717] p-8 text-center shadow-2xl shadow-zinc-950 transition-colors hover:border-zinc-700 sm:p-12">
              <div className="pointer-events-none absolute inset-0 bg-[repeating-linear-gradient(-45deg,rgba(255,255,255,0.02)_0px,rgba(255,255,255,0.02)_1px,transparent_1px,transparent_7px)]" />
              <div className="relative flex flex-col items-center gap-6">
                <h2 className="font-[family-name:var(--font-geist-pixel-square)] text-2xl text-zinc-100 sm:text-3xl">
                  Ready to enter the arena?
                </h2>
                <p className="max-w-lg text-base text-zinc-400">
                  Viewing public analytics for{" "}
                  <span className="font-medium text-zinc-200">{handle}</span>.
                  Sign in to challenge others in a 1v1 duel, track your own
                  progress, and climb the ranks.
                </p>
                <form
                  action={async () => {
                    "use server";
                    await import("@/auth").then((m) => m.signIn("google"));
                  }}
                >
                  <GoogleSignInButton
                    text="Sign in with Google"
                    className="bg-zinc-100 px-5 py-2.5 text-sm text-zinc-900 hover:bg-white hover:shadow-[0_0_20px_-5px_rgba(255,255,255,0.3)]"
                  />
                </form>
              </div>
            </div>
          </div>
        )}
      </>
    );
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to load analytics";
    return (
      <div className="min-h-screen bg-[#070707] p-6 text-zinc-100">
        <div className="rounded-xl border border-red-900/40 bg-red-950/30 p-4 text-sm text-red-200">
          Failed to load analytics for{" "}
          <span className="font-semibold">{handle}</span>: {message}
        </div>
      </div>
    );
  }
}