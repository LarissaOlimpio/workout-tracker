import { Link } from "@tanstack/react-router";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "../../components/ui/Button";
import { Label } from "../../components/ui/Label";
import { Input } from "../../components/ui/Input";
import { loginSchema, type LoginFormData } from "./schemas/loginSchema";
import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { api } from "../../lib/api";
import { useQueryClient } from "@tanstack/react-query";
import { PasswordInput } from "../../components/ui/PasswordInput";

export function LoginForm() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });
  const [serverError, setServerError] = useState("");
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const onSubmit = async (data: LoginFormData) => {
    setServerError("");
    try {
      await api("/auth/login", {
        method: "POST",
        body: JSON.stringify(data),
      });
      queryClient.removeQueries({ queryKey: ["me"] });
      await navigate({ to: "/" });
    } catch (error) {
      setServerError(
        (error as Error & { status?: number }).status === 401
          ? "E-mail ou senha inválidos"
          : (error as Error).message,
      );
    }
  };
  return (
    <div className="w-full max-w-lg">
      <div className="space-y-3">
        <h2 className="text-3xl font-bold">Login</h2>

        <p className="mt-10 text-muted-foreground">Informe suas credenciais</p>
      </div>

      <form
        className="mt-10 space-y-6"
        noValidate
        onSubmit={handleSubmit(onSubmit)}
      >
        {serverError && <p className="text-sm text-red-500">{serverError}</p>}
        <div className="space-y-2">
          <Label htmlFor="email">E-mail</Label>
          <Input
            id="email"
            type="email"
            placeholder="email@empresa.com"
            {...register("email")}
          />

          {errors.email && (
            <p className="text-sm text-red-500">{errors.email.message}</p>
          )}
          <Label htmlFor="password">Senha</Label>
          <PasswordInput
            id="password"
            placeholder="••••••••"
            {...register("password")}
          />
          {errors.password && (
            <p className="text-sm text-red-500">{errors.password.message}</p>
          )}
        </div>
        <div className="flex justify-end">
          <Link
            to="/forgotPasswordForm"
            className="text-sm font-medium text-black hover:underline"
          >
            Esqueceu sua senha?
          </Link>
        </div>
        <div>
          <Button className="w-full" type="submit">
            Entrar
          </Button>
        </div>

        <div className="text-center text-sm">
          Não tem uma conta?{" "}
          <Link to="/signup" className="font-medium text-black hover:underline">
            Cadastre-se
          </Link>
        </div>
      </form>
    </div>
  );
}
