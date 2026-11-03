import { createFileRoute } from "@tanstack/react-router";

import { AuthLayout } from "../feature/auth/AuthLayout";
import { LoginForm } from "../feature/auth/LoginForm";
export const Route = createFileRoute("/login")({
  component: () => (
    <AuthLayout>
      <LoginForm />
    </AuthLayout>
  ),
});
