import type { ReactNode } from "react";
import auth_layout from "../../assets/auth_layout.jpg";
interface AuthLayoutProps {
  children: ReactNode;
}

export function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="h-screen bg-slate-200">
      <div className="grid h-full w-full md:grid-cols-[40%_60%]">
        <div
          className="hidden items-center justify-center bg-cover bg-center md:flex"
          style={{ backgroundImage: `url(${auth_layout})` }}
        >
          <h1 className="text-6xl font-bold text-white">Workout Tracker</h1>
        </div>

        <div className="flex items-center justify-center bg-white px-6 md:px-16">
          {children}
        </div>
      </div>
    </div>
  );
}
