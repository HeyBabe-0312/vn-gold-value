import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-medium transition-colors",
  {
    variants: {
      variant: {
        default: "bg-[#F59E0B]/10 text-[#F59E0B]",
        up: "bg-[#10B981]/10 text-[#10B981]",
        down: "bg-[#EF4444]/10 text-[#EF4444]",
        neutral: "bg-[var(--bg-card-hover)] text-[var(--text-secondary)]",
        purple: "bg-[#8B5CF6]/10 text-[#8B5CF6]",
        live: "bg-[#10B981]/15 text-[#10B981] border border-[#10B981]/20",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
