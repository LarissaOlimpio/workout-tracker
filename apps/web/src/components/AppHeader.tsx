import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, useNavigate } from "@tanstack/react-router";
import { Menu } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { api } from "../lib/api";
import { accountQueryOptions } from "../lib/account-query";
import { firstName, initials } from "../lib/user-display";

export function AppHeader() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data: user, isLoading } = useQuery(accountQueryOptions);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!menuOpen) return;
    const closeOnOutsideClick = (event: MouseEvent | TouchEvent) => {
      if (
        event.target instanceof Node &&
        !menuRef.current?.contains(event.target)
      ) {
        setMenuOpen(false);
      }
    };
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMenuOpen(false);
    };
    document.addEventListener("mousedown", closeOnOutsideClick);
    document.addEventListener("touchstart", closeOnOutsideClick);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("mousedown", closeOnOutsideClick);
      document.removeEventListener("touchstart", closeOnOutsideClick);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [menuOpen]);

  async function logout() {
    setMenuOpen(false);
    try {
      await api<void>("/auth/logout", { method: "POST" });
    } finally {
      queryClient.clear();
      await navigate({ to: "/login" });
    }
  }

  return (
    <header className="mb-10 flex items-center justify-between gap-5">
      <Link to="/" className="text-3xl font-extrabold tracking-tight">
        TRAIN <span className="text-primary">UP</span>
      </Link>
      <div className="flex items-center gap-4 sm:gap-5">
        <div
          aria-label={user ? `Avatar de ${user.name}` : "Avatar carregando"}
          className="grid size-12 place-items-center rounded-full bg-input text-base font-bold ring-1 ring-border"
        >
          {!isLoading && user ? initials(user.name) : null}
        </div>
        {!isLoading && user && (
          <p className="hidden text-lg sm:block">Olá, {firstName(user.name)}</p>
        )}
        <div ref={menuRef} className="relative">
          <button
            type="button"
            aria-label="Abrir menu"
            aria-expanded={menuOpen}
            aria-controls="app-header-menu"
            onClick={() => setMenuOpen((open) => !open)}
            className="grid size-10 place-items-center rounded-lg hover:bg-input focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            <Menu className="size-7" />
          </button>
          {menuOpen && (
            <div
              id="app-header-menu"
              className="absolute right-0 top-12 z-20 min-w-56 rounded-xl border border-border bg-surface p-2 shadow-xl"
            >
              <Link
                to="/account"
                onClick={() => setMenuOpen(false)}
                className="block rounded-lg px-4 py-3 text-sm font-semibold hover:bg-input"
              >
                Configurações da conta
              </Link>
              <button
                type="button"
                onClick={() => void logout()}
                className="block w-full rounded-lg px-4 py-3 text-left text-sm font-semibold text-muted-foreground hover:bg-input hover:text-foreground"
              >
                Sair
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
