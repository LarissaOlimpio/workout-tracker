import type { ReactNode } from "react";
import { Dumbbell } from "lucide-react";
import auth_layout from "../../assets/auth_layout.jpg";
interface AuthLayoutProps {
  children: ReactNode;
}

export function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      <div className="grid min-h-screen w-full md:grid-cols-2">
        <div
          className="relative hidden items-center justify-center bg-cover bg-center md:flex"
          style={{ backgroundImage: `url(${auth_layout})` }}
        >
          <div className="absolute inset-0 bg-black/55" />
          <div className="relative flex flex-col items-center gap-4 text-center">
            <div className="flex items-center gap-3 text-6xl font-extrabold tracking-tight text-foreground">
              <Dumbbell className="h-14 w-14 text-accent" strokeWidth={3} />
              <span>TRAIN <span className="text-primary">UP</span></span>
            </div>
            <h1 className="text-3xl font-semibold text-foreground">Workout Tracker</h1>
          </div>
        </div>

        <div className="flex min-h-screen items-center justify-center bg-background px-6 py-12 md:px-16">
          {children}
        </div>
      </div>
    </div>
  );
}
