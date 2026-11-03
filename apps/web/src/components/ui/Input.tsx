import * as React from "react";

type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

export function Input({ className, ...props }: InputProps) {
  return (
    <input
      className={[
        "flex h-10 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm",
        "placeholder:text-slate-400",
        "focus:outline-none focus:ring-2 focus:ring-blue-500",
        "disabled:cursor-not-allowed disabled:opacity-50",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      {...props}
    />
  );
}
