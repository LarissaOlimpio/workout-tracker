import { Link } from "@tanstack/react-router";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useMutation } from "@tanstack/react-query";
import { Button } from "../../components/ui/Button";
import { Label } from "../../components/ui/Label";
import { Input } from "../../components/ui/Input";
import {
  forgotPasswordSchema,
  type ForgotPasswordFormData,
} from "./schemas/forgotPasswordSchema";
import { api } from "../../lib/api";
export function ForgotPasswordForm() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
  });
  const mutation = useMutation({
    mutationFn: (data: ForgotPasswordFormData) =>
      api("/auth/forgot-password", {
        method: "POST",
        body: JSON.stringify(data),
      }),
  });

  return (
    <div className="w-full max-w-lg">
      <div className="space-y-2">
        <h2 className="text-3xl font-bold">Recuperar senha</h2>

        <p className="text-muted-foreground">
          Informe seu e-mail para receber as instruções.
        </p>
      </div>

      <form
        className="mt-10 space-y-6"
        noValidate
        onSubmit={handleSubmit((data) => mutation.mutate(data))}
      >
        {mutation.isSuccess && (
          <p className="text-sm text-accent">
            Se o e-mail estiver cadastrado, enviamos um link de recuperação
          </p>
        )}
        {mutation.isError && (
          <p className="text-sm text-danger">Não foi possível enviar o link. Tente novamente.</p>
        )}
        <div className="space-y-2">
          <Label htmlFor="email">E-mail</Label>

          <Input
            id="email"
            type="email"
            placeholder="email@empresa.com"
            {...register("email")}
          />
          {errors.email && (
            <p className="text-sm text-danger">{errors.email.message}</p>
          )}
        </div>

        <Button className="w-full" type="submit">
          Enviar recuperação
        </Button>

        <div className="text-center">
          <Link to="/login" className="font-medium text-accent hover:underline">
            Voltar para o login
          </Link>
        </div>
      </form>
    </div>
  );
}
