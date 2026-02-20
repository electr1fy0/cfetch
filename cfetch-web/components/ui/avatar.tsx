import * as React from "react";

import { cn } from "@/lib/utils";

function Avatar({
  className,
  ...props
}: React.ComponentProps<"span">) {
  return (
    <span
      data-slot="avatar"
      className={cn(
        "relative inline-flex size-8 shrink-0 items-center justify-center overflow-hidden rounded-full border border-dashed border-zinc-700 bg-zinc-900",
        className,
      )}
      {...props}
    />
  );
}

function AvatarFallback({
  className,
  ...props
}: React.ComponentProps<"span">) {
  return (
    <span
      data-slot="avatar-fallback"
      className={cn(
        "inline-flex size-full items-center justify-center text-xs uppercase text-zinc-300",
        className,
      )}
      {...props}
    />
  );
}

export { Avatar, AvatarFallback };
