import prisma from "@/lib/prisma";
import { Badge } from "@/components/ui/badge";
import { defaultShikiTheme, getShiki } from "@/lib/shiki";
import { notFound } from "next/navigation";

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const snippet = await prisma.snippet.findUnique({
    where: { id },
  });

  if (!snippet) {
    notFound();
  }

  const highlighter = await getShiki();

  let html: string;
  try {
    html = highlighter.codeToHtml(snippet.content, {
      lang: snippet.language || "plaintext",
      theme: defaultShikiTheme,
    });
  } catch {
    html = highlighter.codeToHtml(snippet.content, {
      lang: "plaintext",
      theme: defaultShikiTheme,
    });
  }

  return (
    <div className="min-h-screen bg-stone-950 p-6 text-stone-100">
      <div className="mx-auto max-w-5xl rounded-xl border border-stone-800 bg-stone-900/70 p-4">
        <div className="mb-3 flex flex-wrap gap-1.5">
          <Badge variant="info-light" size="sm">
            {snippet.language || "plaintext"}
          </Badge>
          <Badge variant="success-light" size="sm">
            {snippet.complexity || "unknown"}
          </Badge>
          <Badge variant="warning-light" size="sm">
            {snippet.difficulty || "unknown"}
          </Badge>
        </div>
        <div className="overflow-x-auto [&_.shiki]:!bg-transparent [&_pre]:!bg-transparent [&_pre]:!m-0 [&_pre]:min-w-max [&_pre]:whitespace-pre [&_pre]:text-xs [&_pre]:leading-5" dangerouslySetInnerHTML={{ __html: html }} />
      </div>
    </div>
  );
}
