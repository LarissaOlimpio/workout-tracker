import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  component: () => (
    <div className="flex min-h-screen items-center justify-center bg-slate-100">
      <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-lg">
        <h1 className="mb-6 text-center text-2xl font-bold">Bem-vindo</h1>

        <p className="mb-4 text-center">
          Este é um exemplo de página inicial. Você pode adicionar conteúdo
          aqui.
        </p>

        <a
          href="/login"
          className="block w-full rounded bg-blue-600 p-2 text-center text-white"
        >
          Ir para Login
        </a>
      </div>
    </div>
  ),
});
