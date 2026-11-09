import { Input } from "../ui/Input";

interface UnitInputProps extends React.ComponentProps<"input"> {
  unit: string;
}

export function UnitInput({ unit, className, ...props }: UnitInputProps) {
  return (
    <div className="relative">
      <Input className={["pr-12", className].filter(Boolean).join(" ")} {...props} />
      <span className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-sm text-muted-foreground">
        {unit}
      </span>
    </div>
  );
}
