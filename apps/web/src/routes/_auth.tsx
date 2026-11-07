import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { meQueryOptions } from "../lib/queries";

export const Route = createFileRoute("/_auth")({
  beforeLoad: async ({ context }) => {
    try {
      await context.queryClient.ensureQueryData(meQueryOptions);
    } catch {
      throw redirect({ to: "/login" });
    }
  },
  component: () => <Outlet />,
});
