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
    <div className="min-h-screen bg-background px-4 py-4 text-foreground sm:px-6 lg:flex lg:h-dvh lg:min-h-0 lg:flex-col lg:overflow-hidden lg:px-8 lg:py-3">
      <div className="mx-auto flex w-full max-w-7xl flex-1 flex-col lg:min-h-0">
        <AppHeader />
        <main className="lg:min-h-0 lg:flex-1">
          <Outlet />
        </main>
      </div>
    </div>
  ),
});
