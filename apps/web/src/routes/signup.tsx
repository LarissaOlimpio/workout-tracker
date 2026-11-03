import { createFileRoute } from "@tanstack/react-router";

import { AuthLayout } from "../feature/auth/AuthLayout";
import { SignupForm } from "../feature/auth/SignupForm";

export const Route = createFileRoute("/signup")({
  component: () => (
    <AuthLayout>
      <SignupForm />
    </AuthLayout>
  ),
});
