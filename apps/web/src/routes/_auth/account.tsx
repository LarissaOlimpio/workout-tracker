import { useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Eye, EyeOff, X } from "lucide-react";
import { useEffect, useState } from "react";
import type { FormEvent, ReactNode } from "react";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { api } from "../../lib/api";
import { accountQueryOptions } from "../../lib/account-query";
import { initials } from "../../lib/user-display";
import {
  changePassword,
  deleteMe,
  updateMe,
  type AccountUser,
} from "../../lib/account-api";

type PasswordField = "currentPassword" | "newPassword" | "confirmPassword";
type AccountForm = { name: string; email: string };
type PasswordForm = Record<PasswordField, string>;
type AccountErrors = Partial<Record<"name" | "email" | PasswordField, string>>;

const emptyPassword: PasswordForm = {
  currentPassword: "",
  newPassword: "",
  confirmPassword: "",
};

function memberSince(createdAt?: string) {
  if (!createdAt) return null;
  const date = new Date(createdAt);
  if (Number.isNaN(date.getTime())) return null;
  const monthYear = new Intl.DateTimeFormat("pt-BR", {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(date);
  return monthYear.charAt(0).toLocaleUpperCase("pt-BR") + monthYear.slice(1);
}

function AccountPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const accountQuery = useQuery(accountQueryOptions);
  const [original, setOriginal] = useState<AccountUser | null>(null);
  const [account, setAccount] = useState<AccountForm>({ name: "", email: "" });
  const [password, setPassword] = useState<PasswordForm>(emptyPassword);
  const [errors, setErrors] = useState<AccountErrors>({});
  const [requestError, setRequestError] = useState("");
  const [success, setSuccess] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [showPassword, setShowPassword] = useState<
    Record<PasswordField, boolean>
  >({
    currentPassword: false,
    newPassword: false,
    confirmPassword: false,
  });
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  useEffect(() => {
    if (!accountQuery.data) return;
    setOriginal(accountQuery.data);
    setAccount({
      name: accountQuery.data.name,
      email: accountQuery.data.email,
    });
  }, [accountQuery.data]);

  const memberDate = memberSince(original?.createdAt);
  const passwordTouched = Object.values(password).some(
    (value) => value.length > 0,
  );

  function cancelChanges() {
    if (original) setAccount({ name: original.name, email: original.email });
    setPassword(emptyPassword);
    setErrors({});
    setRequestError("");
    setSuccess("");
  }

  async function saveChanges(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!original) return;
    setErrors({});
    setRequestError("");
    setSuccess("");

    const trimmedName = account.name.trim();
    const normalizedEmail = account.email.trim().toLowerCase();
    const nameChanged = trimmedName !== original.name;
    const emailChanged = normalizedEmail !== original.email.toLowerCase();
    const nextErrors: AccountErrors = {};

    if (nameChanged) {
      const validName = /^[\p{L}\p{M}]+(?:[ '\u2019-][\p{L}\p{M}]+)*$/u;
      if (
        trimmedName.length < 2 ||
        trimmedName.length > 100 ||
        !validName.test(trimmedName)
      ) {
        nextErrors.name = "Informe um nome válido (2 a 100 caracteres).";
      }
    }
    if (emailChanged && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      nextErrors.email = "Informe um e-mail válido.";
    }

    if (passwordTouched) {
      if (
        password.currentPassword.length < 8 ||
        password.currentPassword.length > 128
      ) {
        nextErrors.currentPassword =
          "A senha deve ter entre 8 e 128 caracteres.";
      }
      if (
        password.newPassword.length < 8 ||
        password.newPassword.length > 128
      ) {
        nextErrors.newPassword = "A senha deve ter entre 8 e 128 caracteres.";
      }
      if (!password.confirmPassword) {
        nextErrors.confirmPassword = "Confirme a nova senha.";
      } else if (password.newPassword !== password.confirmPassword) {
        nextErrors.confirmPassword = "As senhas não coincidem.";
      }
      if (
        password.currentPassword &&
        password.currentPassword === password.newPassword
      ) {
        nextErrors.newPassword = "A nova senha deve ser diferente da atual.";
      }
    }

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    const userChanged = nameChanged || emailChanged;
    if (!userChanged && !passwordTouched) {
      setSuccess("Nenhuma alteração para salvar.");
      return;
    }

    setIsSaving(true);
    try {
      if (userChanged) {
        const updates: { name?: string; email?: string } = {};
        if (nameChanged) updates.name = trimmedName;
        if (emailChanged) updates.email = normalizedEmail;
        const updatedUser = await updateMe(updates);
        setOriginal(updatedUser);
        setAccount({ name: updatedUser.name, email: updatedUser.email });
        queryClient.setQueryData(accountQueryOptions.queryKey, updatedUser);
        queryClient.setQueryData(["me"], updatedUser);
      }

      if (passwordTouched) {
        try {
          await changePassword({
            currentPassword: password.currentPassword,
            newPassword: password.newPassword,
          });
        } catch (error) {
          const apiError = error as Error & { status?: number };
          if (apiError.status === 401) {
            setErrors({ currentPassword: "Senha atual incorreta." });
            return;
          }
          if (
            apiError.status === 400 &&
            apiError.message
              .toLowerCase()
              .includes("new password must be different")
          ) {
            setErrors({
              newPassword: "A nova senha deve ser diferente da atual.",
            });
            return;
          }
          if (apiError.status === 400) {
            setRequestError(
              "Não foi possível alterar a senha. Confira os campos e tente novamente.",
            );
            return;
          }
          throw error;
        }
      }

      setPassword(emptyPassword);
      setSuccess("Alterações salvas com sucesso.");
    } catch (error) {
      const apiError = error as Error & { status?: number };
      if (apiError.status === 409) {
        setErrors({ email: "E-mail já cadastrado." });
      } else {
        setRequestError(
          "Não foi possível salvar as alterações. Tente novamente.",
        );
      }
    } finally {
      setIsSaving(false);
    }
  }

  async function confirmDelete() {
    setIsDeleting(true);
    setDeleteError("");
    try {
      await deleteMe();
      try {
        await api<void>("/auth/logout", { method: "POST" });
      } catch {
        // The account is deleted; clear local session state either way.
      }
      queryClient.clear();
      await navigate({ to: "/login" });
    } catch {
      setDeleteError("Não foi possível excluir sua conta. Tente novamente.");
      setIsDeleting(false);
    }
  }

  if (accountQuery.isLoading) {
    return (
      <p className="py-8 text-center text-muted-foreground">
        Carregando configurações da conta...
      </p>
    );
  }
  if (accountQuery.isError || !original) {
    return (
      <p className="py-8 text-center text-danger">
        Não foi possível carregar as configurações da conta.
      </p>
    );
  }

  return (
    <>
      <div className="mb-12">
        <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl">
          Configurações da Conta
        </h1>
        <p className="mt-3 text-lg text-muted-foreground sm:text-xl">
          Gerencie seus dados pessoais, altere sua senha ou encerre sua conta a
          qualquer momento.
        </p>
      </div>

      <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1.9fr)_minmax(340px,0.95fr)]">
        <section className="rounded-3xl border border-border bg-surface p-6 sm:p-8 lg:p-10">
          <form onSubmit={saveChanges} noValidate>
            <h2 className="text-xl font-extrabold uppercase tracking-wide">
              Dados pessoais
            </h2>
            <div className="mt-6 space-y-5">
              <FormField
                label="Nome Completo"
                htmlFor="account-name"
                error={errors.name}
              >
                <Input
                  id="account-name"
                  autoComplete="name"
                  value={account.name}
                  onChange={(event) =>
                    setAccount({ ...account, name: event.target.value })
                  }
                  disabled={isSaving}
                  className="h-14 rounded-xl border-2 px-4 text-base sm:text-lg"
                />
              </FormField>
              <FormField
                label="E-mail"
                htmlFor="account-email"
                error={errors.email}
              >
                <Input
                  id="account-email"
                  type="email"
                  autoComplete="email"
                  value={account.email}
                  onChange={(event) =>
                    setAccount({ ...account, email: event.target.value })
                  }
                  disabled={isSaving}
                  className="h-14 rounded-xl border-2 px-4 text-base sm:text-lg"
                />
              </FormField>
            </div>

            <div className="my-8 border-t border-border" />

            <h2 className="text-xl font-extrabold uppercase tracking-wide">
              Segurança e senha
            </h2>
            <div className="mt-6 space-y-5">
              <PasswordInput
                id="current-password"
                label="Senha Atual"
                value={password.currentPassword}
                error={errors.currentPassword}
                visible={showPassword.currentPassword}
                disabled={isSaving}
                onChange={(value) =>
                  setPassword({ ...password, currentPassword: value })
                }
                onToggle={() =>
                  setShowPassword({
                    ...showPassword,
                    currentPassword: !showPassword.currentPassword,
                  })
                }
              />
              <PasswordInput
                id="new-password"
                label="Nova Senha"
                value={password.newPassword}
                error={errors.newPassword}
                visible={showPassword.newPassword}
                disabled={isSaving}
                onChange={(value) =>
                  setPassword({ ...password, newPassword: value })
                }
                onToggle={() =>
                  setShowPassword({
                    ...showPassword,
                    newPassword: !showPassword.newPassword,
                  })
                }
              />
              <PasswordInput
                id="confirm-password"
                label="Confirmar Nova Senha"
                value={password.confirmPassword}
                error={errors.confirmPassword}
                visible={showPassword.confirmPassword}
                disabled={isSaving}
                onChange={(value) =>
                  setPassword({ ...password, confirmPassword: value })
                }
                onToggle={() =>
                  setShowPassword({
                    ...showPassword,
                    confirmPassword: !showPassword.confirmPassword,
                  })
                }
              />
            </div>

            {requestError && (
              <p role="alert" className="mt-5 text-sm text-danger">
                {requestError}
              </p>
            )}
            {success && (
              <p role="status" className="mt-5 text-sm text-accent">
                {success}
              </p>
            )}
            <div className="mt-7 flex flex-wrap items-center gap-5">
              <Button
                type="submit"
                disabled={isSaving}
                className="h-12 min-w-48 px-7 text-base"
              >
                {isSaving ? "Salvando..." : "Salvar Alterações"}
              </Button>
              <button
                type="button"
                onClick={cancelChanges}
                disabled={isSaving}
                className="rounded-full px-2 py-2 text-base font-bold text-muted-foreground hover:text-foreground disabled:opacity-50"
              >
                Cancelar
              </button>
            </div>
          </form>
        </section>

        <aside className="space-y-6">
          <section className="flex items-center gap-5 rounded-3xl border border-border bg-surface p-7 sm:p-9">
            <div className="grid size-24 shrink-0 place-items-center rounded-full bg-input text-2xl font-extrabold ring-1 ring-border">
              {initials(original.name)}
            </div>
            <div className="min-w-0">
              <h2 className="text-xl font-extrabold sm:text-2xl">
                {original.name}
              </h2>
              {memberDate && (
                <p className="mt-1 text-base text-muted-foreground sm:text-lg">
                  Membro desde {memberDate}
                </p>
              )}
            </div>
          </section>

          <section className="rounded-3xl border border-danger/70 bg-danger/10 p-7 sm:p-9">
            <h2 className="text-lg font-extrabold uppercase text-danger">
              Zona de perigo
            </h2>
            <h3 className="mt-6 text-2xl font-extrabold">Excluir Conta</h3>
            <p className="mt-3 text-base leading-relaxed text-muted-foreground sm:text-lg">
              Esta ação é permanente e todos os seus dados de treino serão
              apagados.
            </p>
            <Button
              type="button"
              variant="outline"
              className="mt-7 h-12 w-full border-danger text-danger hover:bg-danger/10 hover:text-danger"
              onClick={() => {
                setDeleteError("");
                setIsDeleteOpen(true);
              }}
            >
              Deletar minha conta
            </Button>
          </section>
        </aside>
      </div>

      {isDeleteOpen && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/70 px-4 py-6">
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-account-title"
            className="w-full max-w-lg rounded-3xl border border-border bg-surface p-6 shadow-2xl sm:p-8"
          >
            <div className="flex items-start justify-between gap-4">
              <h2 id="delete-account-title" className="text-2xl font-extrabold">
                Excluir sua conta?
              </h2>
              <button
                type="button"
                aria-label="Fechar confirmação"
                onClick={() => setIsDeleteOpen(false)}
                disabled={isDeleting}
                className="rounded-lg p-2 text-muted-foreground hover:bg-input hover:text-foreground"
              >
                <X className="size-5" />
              </button>
            </div>
            <p className="mt-4 leading-relaxed text-muted-foreground">
              Esta ação é permanente e todos os seus dados de treino serão
              apagados.
            </p>
            {deleteError && (
              <p role="alert" className="mt-4 text-sm text-danger">
                {deleteError}
              </p>
            )}
            <div className="mt-7 flex flex-wrap justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsDeleteOpen(false)}
                disabled={isDeleting}
              >
                Cancelar
              </Button>
              <Button
                type="button"
                disabled={isDeleting}
                className="bg-danger hover:bg-danger/90"
                onClick={confirmDelete}
              >
                {isDeleting ? "Excluindo..." : "Excluir definitivamente"}
              </Button>
            </div>
          </section>
        </div>
      )}
    </>
  );
}

function FormField({
  label,
  htmlFor,
  error,
  children,
}: {
  label: string;
  htmlFor: string;
  error?: string;
  children: ReactNode;
}) {
  return (
    <div className="space-y-2">
      <label htmlFor={htmlFor} className="block text-base sm:text-lg">
        {label}
      </label>
      {children}
      {error && <p className="text-sm text-danger">{error}</p>}
    </div>
  );
}

function PasswordInput({
  id,
  label,
  value,
  error,
  visible,
  disabled,
  onChange,
  onToggle,
}: {
  id: string;
  label: string;
  value: string;
  error?: string;
  visible: boolean;
  disabled: boolean;
  onChange: (value: string) => void;
  onToggle: () => void;
}) {
  return (
    <div className="space-y-2">
      <label htmlFor={id} className="block text-base sm:text-lg">
        {label}
      </label>
      <div className="relative">
        <Input
          id={id}
          type={visible ? "text" : "password"}
          autoComplete={
            id === "current-password" ? "current-password" : "new-password"
          }
          value={value}
          onChange={(event) => onChange(event.target.value)}
          disabled={disabled}
          className="h-14 rounded-xl border-2 px-4 pr-14 text-base sm:text-lg"
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `${id}-error` : undefined}
        />
        <button
          type="button"
          aria-label={
            visible
              ? `Ocultar ${label.toLowerCase()}`
              : `Mostrar ${label.toLowerCase()}`
          }
          onClick={onToggle}
          className="absolute inset-y-0 right-0 grid w-12 place-items-center text-muted-foreground hover:text-foreground"
        >
          {visible ? <EyeOff className="size-5" /> : <Eye className="size-5" />}
        </button>
      </div>
      {error && (
        <p id={`${id}-error`} className="text-sm text-danger">
          {error}
        </p>
      )}
    </div>
  );
}

export const Route = createFileRoute("/_auth/account")({
  component: AccountPage,
});
