import * as React from "react";

type LabelProps = React.LabelHTMLAttributes<HTMLLabelElement>;

export function Label({ className, children, ...props }: LabelProps) {
  return (
    <label
      className={["text-sm font-medium text-slate-700", className]
        .filter(Boolean)
        .join(" ")}
      {...props}
    >
      {children}
    </label>
  );
}
