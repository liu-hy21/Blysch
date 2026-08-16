import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export function Button({
  className,
  variant = "gold",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "gold" | "ghost" | "danger";
}) {
  return (
    <button
      className={cn(
        "inline-flex min-h-11 items-center justify-center border-2 border-ink px-4 text-sm active:translate-x-[3px] active:translate-y-[3px] active:shadow-none disabled:opacity-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold",
        variant === "gold" && "bg-gold text-ink shadow-[3px_3px_0_var(--ink)]",
        variant === "ghost" && "bg-card text-ink shadow-[3px_3px_0_var(--ink)]",
        variant === "danger" && "bg-danger text-card shadow-[3px_3px_0_var(--ink)]",
        className,
      )}
      {...props}
    />
  );
}
