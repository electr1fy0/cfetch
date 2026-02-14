import { auth } from "@/auth";
import { Badge } from "@/components/ui/badge";
import { defaultShikiTheme, getShiki } from "@/lib/shiki";
import Link from "next/link";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import { CreateSnippetDialog } from "@/components/create-snippet-dialog";

export default async function Snippets() {
  const session = await auth();

  if (!session?.user) redirect("/landing");

  const snippets = await prisma.snippet.findMany({
    orderBy: { createdAt: "desc" },
    take: 20,
  });
  const highlighter = await getShiki();
  const renderedSnippets = snippets.map((snippet) => {
    try {
      return {
        id: snippet.id,
        html: highlighter.codeToHtml(snippet.content, {
          lang: snippet.language || "plaintext",
          theme: defaultShikiTheme,
        }),
      };
    } catch {
      return {
        id: snippet.id,
        html: highlighter.codeToHtml(snippet.content, {
          lang: "plaintext",
          theme: defaultShikiTheme,
        }),
      };
    }
  });
  const htmlById = new Map(
    renderedSnippets.map((item) => [item.id, item.html]),
  );

  return (
    <div className="min-h-screen bg-stone-950 p-4 text-stone-100 sm:p-6">
      <div className="w-full space-y-5">
        <header className="rounded-xl border border-stone-800 bg-stone-900/70 p-4">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="rounded-md border border-stone-700 bg-stone-950 px-2 py-1 font-[family-name:var(--font-geist-mono)] text-xs text-stone-300">
                CF
              </div>
              <div>
                <p className="text-lg font-semibold leading-none">cfetch</p>
                <p className="font-[family-name:var(--font-geist-mono)] text-[11px] uppercase tracking-wide text-stone-500">
                  competition cockpit
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <CreateSnippetDialog />
            </div>
          </div>
        </header>

        <section className="space-y-3 rounded-xl border border-stone-800 bg-stone-900/65 p-4">
          <h2 className="text-lg font-semibold">Recent snippets</h2>
          {snippets.length === 0 ? (
            <p className="text-sm text-stone-400">
              No snippets yet. Click Create to add one.
            </p>
          ) : (
            <ul className="grid gap-2 md:[grid-template-columns:repeat(2,minmax(0,1fr))]">
              {snippets.map((snippet) => (
                <li
                  key={snippet.id}
                  className="min-w-0 rounded-md border border-stone-800 bg-stone-950 p-3"
                >
                  <Link
                    href={`/snippets/${snippet.id}`}
                    className="block min-w-0"
                  >
                    <div className="flex flex-wrap gap-1.5">
                      <Badge variant="info-light" size="sm">
                        {snippet.language ?? "plaintext"}
                      </Badge>
                      <Badge variant="success-light" size="sm">
                        {snippet.complexity ?? "unknown"}
                      </Badge>
                      <Badge variant="warning-light" size="sm">
                        {snippet.difficulty ?? "unknown"}
                      </Badge>
                    </div>
                    <div
                      className="mt-2 min-w-0 max-w-full overflow-x-auto [&_.shiki]:!bg-transparent [&_pre]:!m-0 [&_pre]:!bg-transparent [&_pre]:min-w-max [&_pre]:whitespace-pre [&_pre]:text-xs [&_pre]:leading-5"
                      dangerouslySetInnerHTML={{
                        __html: htmlById.get(snippet.id) ?? "",
                      }}
                    />
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
