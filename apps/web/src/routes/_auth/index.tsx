import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { api } from "../../lib/api";
import { meQueryOptions } from "../../lib/queries";

function HomePage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data: user } = useQuery(meQueryOptions);

  const logout = useMutation({
    mutationFn: () => api("/auth/logout", { method: "POST" }),
    onSuccess: async () => {
      queryClient.clear();
      await navigate({ to: "/login" });
    },
  });

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-6">
      <div className="w-full max-w-md rounded-2xl border border-border bg-surface p-8 shadow-lg">
        <h1 className="mb-6 text-center text-2xl font-bold">Bem-vindo</h1>
        <p className="mb-4 text-center">Olá, {user?.name}</p>
        <p className="mb-4 text-center">Este é um exemplo de página inicial.</p>

        <button
          type="button"
          onClick={() => logout.mutate()}
          disabled={logout.isPending}
          className="mt-4 block w-full rounded-full bg-primary p-2 text-center font-bold text-primary-foreground transition-colors hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:opacity-60"
        >
          Sair
        </button>
      </div>
    </div>
  );
}

export const Route = createFileRoute("/_auth/")({
  component: HomePage,
});
