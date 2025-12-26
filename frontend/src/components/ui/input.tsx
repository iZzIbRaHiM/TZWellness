import * as React from "react";
import { cn } from "@/lib/utils";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, error, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-12 w-full rounded-xl border-2 bg-white/80 px-4 py-3 text-sm text-emerald-900",
          "ring-offset-sand-100 transition-all duration-200 ease-smooth",
          "placeholder:text-emerald-400",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/30 focus-visible:ring-offset-2",
          "focus-visible:border-emerald-500",
          "disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-sand-100",
          error 
            ? "border-red-400 focus-visible:border-red-500 focus-visible:ring-red-500/30 animate-shake" 
            : "border-sand-200 hover:border-sand-300",
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Input.displayName = "Input";

export { Input };
