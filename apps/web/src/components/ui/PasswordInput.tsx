// components/password-input.tsx
import { forwardRef, useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { Input } from "./Input";

export const PasswordInput = forwardRef<
  HTMLInputElement,
  Omit<React.ComponentProps<"input">, "type">
>((props, ref): React.ReactElement => {
  const [visible, setVisible] = useState(false);

  return (
    <div className="relative">
      <Input
        type={visible ? "text" : "password"}
        className="pr-10"
        ref={ref}
        {...props}
      />
      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        aria-label={visible ? "Ocultar senha" : "Mostrar senha"}
        className="absolute inset-y-0 right-0 flex items-center px-3 text-muted-foreground hover:text-foreground"
      >
        {visible ? <EyeOff size={18} /> : <Eye size={18} />}
      </button>
    </div>
  );
});
PasswordInput.displayName = "PasswordInput";
