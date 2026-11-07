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
    <div className="flex min-h-screen items-center justify-center bg-slate-100">
      <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-lg">
        <h1 className="mb-6 text-center text-2xl font-bold">Bem-vindo</h1>
        <p className="mb-4 text-center">Olá, {user?.name}</p>
        <p className="mb-4 text-center">Este é um exemplo de página inicial.</p>

        <button
          type="button"
          onClick={() => logout.mutate()}
          disabled={logout.isPending}
          className="mt-4 block w-full rounded bg-slate-600 p-2 text-center text-white disabled:opacity-60"
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
