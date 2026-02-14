"use server";

import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";

export async function createSnippet(formData: FormData) {
  const session = await auth();
  if (!session?.user) return;

  const content = formData.get("content") as string;
  const language = formData.get("language") as string;
  const complexity = formData.get("complexity") as string;
  const difficulty = formData.get("difficulty") as string;

  if (!content || content.trim().length === 0) {
    throw new Error("Message cannot be empty");
  }

  const snippet = await prisma.snippet.create({
    data: {
      content,
      authorId: session.user.id,
      language: language || null,
      difficulty: difficulty || null,
      complexity: complexity || null,
    },
  });

  redirect(`/snippets/${snippet.id}`);
}
