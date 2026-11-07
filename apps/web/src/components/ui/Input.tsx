import * as React from "react";

export const Input = React.forwardRef<
  HTMLInputElement,
  React.ComponentProps<"input">
>(({ className, ...props }, ref) => {
  return (
    <input
      className={[
        "flex h-10 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm",
        "placeholder:text-slate-400",
        "focus:outline-none focus:ring-2 focus:ring-green-600",
        "disabled:cursor-not-allowed disabled:opacity-50",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      ref={ref}
      {...props}
    />
  );
});

Input.displayName = "Input";
