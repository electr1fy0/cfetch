import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex w-fit shrink-0 items-center justify-center gap-1 overflow-hidden whitespace-nowrap rounded-md border border-transparent px-2 py-0.5 text-xs font-medium transition-all [&>svg]:size-3 [&>svg]:pointer-events-none",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground",
        secondary: "bg-secondary text-secondary-foreground",
        destructive: "bg-destructive/15 text-destructive border-destructive/30",
        outline: "border-border text-foreground",
        info: "bg-info text-info-foreground",
        success: "bg-success text-success-foreground",
        warning: "bg-warning text-warning-foreground",
        invert: "bg-invert text-invert-foreground",
        "primary-outline": "border-primary/40 text-primary",
        "warning-outline": "border-warning/40 text-warning",
        "success-outline": "border-success/40 text-success",
        "info-outline": "border-info/40 text-info",
        "destructive-outline": "border-destructive/40 text-destructive",
        "invert-outline": "border-invert/40 text-invert",
        "primary-light": "bg-primary/15 text-primary",
        "warning-light": "bg-warning/15 text-warning",
        "success-light": "bg-success/15 text-success",
        "info-light": "bg-info/15 text-info",
        "destructive-light": "bg-destructive/15 text-destructive",
        "invert-light": "bg-invert/15 text-invert-foreground",
      },
      size: {
        default: "h-5",
        xs: "h-4 px-1.5 text-[10px]",
        sm: "h-5 px-2 text-[11px]",
        lg: "h-6 px-2.5 text-xs",
        xl: "h-7 px-3 text-sm",
      },
      radius: {
        default: "rounded-md",
        full: "rounded-full",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
      radius: "default",
    },
  },
);

function Badge({
  className,
  variant = "default",
  size = "default",
  radius = "default",
  render,
  ...props
}: useRender.ComponentProps<"span"> & VariantProps<typeof badgeVariants>) {
  return useRender({
    defaultTagName: "span",
    props: mergeProps<"span">(
      {
        className: cn(badgeVariants({ className, variant, size, radius })),
      },
      props,
    ),
    render,
    state: {
      slot: "badge",
      variant,
      size,
      radius,
    },
  });
}

export { Badge, badgeVariants };
