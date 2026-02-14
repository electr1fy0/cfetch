"use client";

import { createSnippet } from "@/app/actions";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { SnippetEditor } from "@/components/snippet-editor";

export function CreateSnippetDialog() {
  return (
    <AlertDialog>
      <AlertDialogTrigger className="h-9 rounded-md border border-stone-700 bg-stone-950 px-3 font-mono text-[11px] font-semibold uppercase tracking-wide text-stone-200 hover:bg-stone-900">
        Create
      </AlertDialogTrigger>
      <AlertDialogContent className="!max-w-none w-[min(96vw,1100px)] border border-stone-800 bg-stone-900 p-4 sm:w-[min(92vw,1100px)]">
        <AlertDialogHeader className="mb-2 place-items-start text-left">
          <AlertDialogTitle className="text-sm font-semibold text-stone-100">
            Create snippet
          </AlertDialogTitle>
        </AlertDialogHeader>
        <form action={createSnippet} className="space-y-3">
          <SnippetEditor />
          <button
            type="submit"
            className="h-9 rounded-md border border-stone-600 bg-stone-100 px-4 font-mono text-xs font-semibold uppercase tracking-wide text-stone-900 hover:bg-white"
          >
            Save snippet
          </button>
        </form>
      </AlertDialogContent>
    </AlertDialog>
  );
}
