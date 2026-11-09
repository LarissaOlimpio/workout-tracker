import { forwardRef, type InputHTMLAttributes, type ReactNode } from "react";

interface ChipCheckboxProps extends Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "type"
> {
  children: ReactNode;
}

export const ChipCheckbox = forwardRef<HTMLInputElement, ChipCheckboxProps>(
  function ChipCheckbox({ children, className, ...props }, ref) {
    return (
      <label
        className={[
          "group inline-flex cursor-pointer items-center justify-center gap-2 rounded-full border border-border bg-input px-4 py-2.5 text-sm font-semibold text-foreground transition-colors",
          "has-[:checked]:border-primary has-[:checked]:bg-primary/10",
          "has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-primary has-[:focus-visible]:ring-offset-2 has-[:focus-visible]:ring-offset-surface",
          className,
        ]
          .filter(Boolean)
          .join(" ")}
      >
        <input type="checkbox" className="peer sr-only" ref={ref} {...props} />
        <span
          aria-hidden="true"
          className="hidden text-primary peer-checked:inline-block"
        >
          ✓
        </span>
        <span>{children}</span>
      </label>
    );
  },
);

ChipCheckbox.displayName = "ChipCheckbox";
