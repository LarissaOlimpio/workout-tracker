import { createFileRoute } from "@tanstack/react-router";
import { AuthLayout } from "../feature/auth/AuthLayout";
import { ForgotPasswordForm } from "../feature/auth/ForgotPasswordForm";
export const Route = createFileRoute("/forgotPasswordForm")({
  component: () => (
    <AuthLayout>
      <ForgotPasswordForm />
    </AuthLayout>
  ),
});
