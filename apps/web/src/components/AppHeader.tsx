import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, useLocation, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, Menu } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { api } from "../lib/api";
import { accountQueryOptions } from "../lib/account-query";
import { firstName, initials } from "../lib/user-display";

const navigation = [
  ["/", "Dashboard"],
  ["/profile/summary", "Meu perfil"],
  ["/profile/setup", "Editar perfil"],
  ["/account", "Configurações da conta"],
] as const;

export function AppHeader() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const queryClient = useQueryClient();
  const { data: user, isLoading } = useQuery(accountQueryOptions);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!menuOpen) return;
    const closeOnOutsideClick = (event: MouseEvent | TouchEvent) => {
      if (event.target instanceof Node && !menuRef.current?.contains(event.target)) setMenuOpen(false);
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
    <header className="mb-4 flex shrink-0 items-center justify-between gap-3 lg:mb-3">
      <div className="flex min-w-0 items-center gap-3">
        <Link to="/" className="text-2xl font-extrabold tracking-tight sm:text-3xl">
          TRAIN <span className="text-primary">UP</span>
        </Link>
        {pathname !== "/" && (
          <Link to="/" aria-label="Voltar ao dashboard" className="inline-flex min-h-10 items-center gap-1 rounded-lg px-2 text-sm font-semibold text-muted-foreground hover:bg-input hover:text-foreground">
            <ArrowLeft className="size-5" /><span className="hidden sm:inline">Dashboard</span>
          </Link>
        )}
      </div>
      <div className="flex items-center gap-2 sm:gap-4">
        <Link to="/account" aria-label="Configurações da conta" className="grid size-10 shrink-0 place-items-center rounded-full bg-input text-sm font-bold ring-1 ring-border sm:size-11">
          {!isLoading && user ? initials(user.name) : null}
        </Link>
        {!isLoading && user && <p className="hidden text-base sm:block">Olá, {firstName(user.name)}</p>}
        <div ref={menuRef} className="relative">
          <button type="button" aria-label="Abrir menu" aria-expanded={menuOpen} aria-controls="app-header-menu" onClick={() => setMenuOpen((open) => !open)} className="grid size-10 place-items-center rounded-lg hover:bg-input focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">
            <Menu className="size-6" />
          </button>
          {menuOpen && (
            <div id="app-header-menu" className="absolute right-0 top-12 z-20 min-w-56 rounded-xl border border-border bg-surface p-2 shadow-xl">
              {navigation.map(([to, label]) => (
                <Link key={to} to={to} onClick={() => setMenuOpen(false)} aria-current={pathname === to ? "page" : undefined} className={`block rounded-lg px-4 py-3 text-sm font-semibold hover:bg-input ${pathname === to ? "bg-input text-foreground" : "text-muted-foreground"}`}>
                  {label}
                </Link>
              ))}
              <button type="button" onClick={() => void logout()} className="block w-full rounded-lg px-4 py-3 text-left text-sm font-semibold text-muted-foreground hover:bg-input hover:text-foreground">Sair</button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
