import { forwardRef, type InputHTMLAttributes, type ReactNode } from "react";

interface RadioCardProps extends Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "type"
> {
  children: ReactNode;
  description?: string;
}

export const RadioCard = forwardRef<HTMLInputElement, RadioCardProps>(
  function RadioCard({ children, description, className, ...props }, ref) {
    return (
      <label
        className={[
          "group relative flex cursor-pointer items-start gap-3 rounded-2xl border border-border bg-input p-4 transition-colors",
          "has-[:checked]:border-primary has-[:checked]:bg-primary/10",
          "has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-primary has-[:focus-visible]:ring-offset-2 has-[:focus-visible]:ring-offset-surface",
          className,
        ]
          .filter(Boolean)
          .join(" ")}
      >
        <input type="radio" className="peer sr-only" ref={ref} {...props} />
        <span
          aria-hidden="true"
          className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full border-2 border-muted-foreground text-transparent peer-checked:border-primary peer-checked:text-primary"
        >
          <span className="size-2.5 rounded-full bg-current" />
        </span>
        <span className="min-w-0">
          <span className="block font-semibold leading-snug text-foreground">
            {children}
          </span>
          {description && (
            <span className="mt-1 block text-sm leading-snug text-muted-foreground">
              {description}
            </span>
          )}
        </span>
      </label>
    );
  },
);

RadioCard.displayName = "RadioCard";
