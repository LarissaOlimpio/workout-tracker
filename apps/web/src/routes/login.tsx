import { createFileRoute } from "@tanstack/react-router";

import { AuthLayout } from "../feature/auth/AuthLayout";
import { LoginForm } from "../feature/auth/LoginForm";
export const Route = createFileRoute("/login")({
  validateSearch: (
    search: Record<string, unknown>,
  ): { passwordReset?: "success" } => ({
    passwordReset: search.passwordReset === "success" ? "success" : undefined,
  }),
  component: () => (
    <AuthLayout>
      <LoginForm
        passwordResetSuccess={Route.useSearch().passwordReset === "success"}
      />
    </AuthLayout>
  ),
});
