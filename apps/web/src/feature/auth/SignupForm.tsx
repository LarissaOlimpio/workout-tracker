import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "../../components/ui/Button";
import { Label } from "../../components/ui/Label";
import { Input } from "../../components/ui/Input";
import { PasswordInput } from "../../components/ui/PasswordInput";
import { signupSchema, type SignupFormData } from "./schemas/signupSchema";
import { useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { api } from "../../lib/api";

export function SignupForm() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
  });
  const [serverError, setServerError] = useState("");
  const navigate = useNavigate();

  const onSubmit = async (data: SignupFormData) => {
    setServerError("");
    try {
      await api("/users", {
        method: "POST",
        body: JSON.stringify({
          name: data.name,
          email: data.email,
          password: data.password,
        }),
      });
      await navigate({ to: "/login" });
    } catch (error) {
      setServerError((error as Error).message);
    }
  };

  return (
    <div className="w-full max-w-lg">
      <div className="space-y-3">
        <h2 className="text-3xl font-bold">Cadastro</h2>

        <p className="mt-10 text-muted-foreground">Informe suas credenciais</p>
      </div>

      <form
        className="mt-10 space-y-6"
        noValidate
        onSubmit={handleSubmit(onSubmit)}
      >
        {serverError && <p className="text-sm text-danger">{serverError}</p>}
        <div className="space-y-2">
          <Label htmlFor="name">Nome</Label>
          <Input
            id="name"
            type="text"
            placeholder="Seu nome completo"
            {...register("name")}
          />
          {errors.name && (
            <p className="text-sm text-danger">{errors.name.message}</p>
          )}
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
          <Label htmlFor="password">Senha</Label>
          <PasswordInput
            id="password"
            placeholder="••••••••"
            {...register("password")}
          />
          {errors.password && (
            <p className="text-sm text-danger">{errors.password.message}</p>
          )}
          <Label htmlFor="confirmPassword">Confirmar Senha</Label>
          <PasswordInput
            id="confirmPassword"
            placeholder="••••••••"
            {...register("confirmPassword")}
          />
          {errors.confirmPassword && (
            <p className="text-sm text-danger">
              {errors.confirmPassword.message}
            </p>
          )}
        </div>
        <div>
          <Button className="w-full" type="submit">
            Criar conta
          </Button>
        </div>
        <div className="text-center text-sm">
          Já possui uma conta?{" "}
          <Link to="/login" className="font-medium text-accent hover:underline">
            Faça o Login
          </Link>
        </div>
      </form>
    </div>
  );
}
