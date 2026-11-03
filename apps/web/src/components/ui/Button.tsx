import * as React from "react";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement>;

export function Button({ className, children, ...props }: ButtonProps) {
  return (
    <button
      className={[
        "inline-flex h-10 items-center justify-center rounded-md bg-green-700 px-4 py-2 text-sm font-medium text-white transition-colors",
        "hover:bg-green-900",
        "disabled:pointer-events-none disabled:opacity-50",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      {...props}
    >
      {children}
    </button>
  );
}
