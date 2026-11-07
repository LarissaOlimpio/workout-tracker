import { useMutation } from "@tanstack/react-query";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { AuthLayout } from "../feature/auth/AuthLayout";
import { Button } from "../components/ui/Button";
import { Label } from "../components/ui/Label";
import { PasswordInput } from "../components/ui/PasswordInput";
import { api } from "../lib/api";

const resetPasswordSchema = z
  .object({
    newPassword: z
      .string()
      .min(8, "Mínimo de 8 caracteres")
      .max(50, "Máximo de 50 caracteres")
      .regex(
        /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d).+$/,
        "A senha deve conter letra maiúscula, minúscula e número",
      ),
    confirmPassword: z.string().min(8, "Mínimo de 8 caracteres"),
  })
  .refine((values) => values.newPassword === values.confirmPassword, {
    message: "As senhas não coincidem",
    path: ["confirmPassword"],
  });

type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

function ResetPasswordPage() {
  const { token } = Route.useSearch();
  const navigate = useNavigate();
  const mutation = useMutation({
    mutationFn: (newPassword: string) =>
      api("/auth/reset-password", {
        method: "POST",
        body: JSON.stringify({ token, newPassword }),
      }),
    onSuccess: () =>
      navigate({ to: "/login", search: { passwordReset: "success" } }),
  });
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
  });
  const invalidToken = mutation.isError &&
    (mutation.error as Error & { status?: number }).status === 400;

  return (
    <AuthLayout>
      <div className="w-full max-w-lg">
        <div className="space-y-3">
          <h2 className="text-3xl font-bold">Redefinir senha</h2>
        </div>
        {invalidToken ? (
          <div className="mt-10 space-y-4">
            <p className="text-sm text-red-500">Link inválido ou expirado</p>
            <Link
              to="/forgotPasswordForm"
              className="font-medium text-black hover:underline"
            >
              Solicitar outro link
            </Link>
          </div>
        ) : (
          <form
            className="mt-10 space-y-6"
            noValidate
            onSubmit={handleSubmit((data) => mutation.mutate(data.newPassword))}
          >
            {mutation.isError && (
              <p className="text-sm text-red-500">Não foi possível redefinir a senha. Tente novamente.</p>
            )}
            <div className="space-y-2">
              <Label htmlFor="newPassword">Nova senha</Label>
              <PasswordInput
                id="newPassword"
                {...register("newPassword")}
              />
              {errors.newPassword && (
                <p className="text-sm text-red-500">
                  {errors.newPassword.message}
                </p>
              )}
              <Label htmlFor="confirmPassword">Confirmar senha</Label>
              <PasswordInput
                id="confirmPassword"
                {...register("confirmPassword")}
              />
              {errors.confirmPassword && (
                <p className="text-sm text-red-500">
                  {errors.confirmPassword.message}
                </p>
              )}
            </div>
            <Button className="w-full" type="submit">
              Redefinir senha
            </Button>
          </form>
        )}
      </div>
    </AuthLayout>
  );
}

export const Route = createFileRoute("/reset-password")({
  validateSearch: (search: Record<string, unknown>) => ({
    token: typeof search.token === "string" ? search.token : "",
  }),
  component: ResetPasswordPage,
});
