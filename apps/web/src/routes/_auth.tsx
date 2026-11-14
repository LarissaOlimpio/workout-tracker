import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { AppHeader } from "../components/AppHeader";
import { meQueryOptions } from "../lib/queries";

export const Route = createFileRoute("/_auth")({
  beforeLoad: async ({ context }) => {
    try {
      await context.queryClient.ensureQueryData(meQueryOptions);
    } catch {
      throw redirect({ to: "/login" });
    }
  },
  component: () => (
    <div className="min-h-screen bg-background px-4 py-7 text-foreground sm:px-6 lg:px-10 lg:py-9">
      <div className="mx-auto max-w-7xl">
        <AppHeader />
        <main>
          <Outlet />
        </main>
      </div>
    </div>
  ),
});
