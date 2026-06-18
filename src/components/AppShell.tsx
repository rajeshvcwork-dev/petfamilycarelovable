import { Link, useLocation, useNavigate } from "@tanstack/react-router";
import { Bell, Home, PawPrint, FileText, MapPin, Settings as Cog, LogOut, Moon, Sun, Sparkles } from "lucide-react";
import { useApp, useCurrentUser } from "@/lib/store";
import { cn } from "@/lib/utils";
import { CompanionBubble } from "./CompanionBubble";
import type { ReactNode } from "react";

const tabs = [
  { to: "/dashboard", label: "Home", icon: Home },
  { to: "/pets", label: "Pets", icon: PawPrint },
  { to: "/records", label: "Records", icon: FileText },
  { to: "/vets", label: "Vets", icon: MapPin },
  { to: "/settings", label: "Settings", icon: Cog },
] as const;

export function AppShell({ children, title }: { children: ReactNode; title?: string }) {
  const user = useCurrentUser();
  const { state, toggleDark, logout } = useApp();
  const navigate = useNavigate();
  const location = useLocation();
  const unread = state.notifications.filter((n) => !n.read).length;

  return (
    <div className="min-h-screen flex flex-col">
      <div className="mx-auto w-full max-w-md flex-1 flex flex-col pb-24">
        {/* Top bar */}
        <header className="sticky top-0 z-30 px-4 pt-5 pb-3 backdrop-blur-xl bg-background/70 border-b border-border/60">
          <div className="flex items-center justify-between gap-3">
            <Link to="/dashboard" className="flex items-center gap-2">
              <div className="h-9 w-9 rounded-2xl gradient-teal grid place-items-center text-white shadow-soft">
                <PawPrint className="h-5 w-5" />
              </div>
              <div className="leading-tight">
                <div className="text-[15px] font-bold tracking-tight">PetCareBuddy</div>
                {title ? (
                  <div className="text-[11px] text-muted-foreground">{title}</div>
                ) : user ? (
                  <div className="text-[11px] text-muted-foreground">Hi, {user.fullName.split(" ")[0]}</div>
                ) : null}
              </div>
            </Link>
            <div className="flex items-center gap-1">
              <button
                aria-label="Toggle theme"
                onClick={toggleDark}
                className="h-9 w-9 grid place-items-center rounded-full hover:bg-muted text-muted-foreground"
              >
                {state.darkMode ? <Sun className="h-4.5 w-4.5" /> : <Moon className="h-4.5 w-4.5" />}
              </button>
              <Link to="/notifications" className="relative h-9 w-9 grid place-items-center rounded-full hover:bg-muted">
                <Bell className="h-5 w-5 text-foreground" />
                {unread > 0 && (
                  <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-destructive ring-2 ring-background" />
                )}
              </Link>
              {user && (
                <button
                  aria-label="Log out"
                  onClick={() => { logout(); navigate({ to: "/auth" }); }}
                  className="h-9 w-9 grid place-items-center rounded-full hover:bg-muted text-muted-foreground"
                >
                  <LogOut className="h-4.5 w-4.5" />
                </button>
              )}
            </div>
          </div>
        </header>

        <main className="flex-1 px-4 pt-4">{children}</main>
      </div>

      {/* Floating Companion Bubble */}
      <CompanionBubble />

      {/* Bottom nav */}
      <nav className="fixed bottom-0 inset-x-0 z-30 pointer-events-none">
        <div className="mx-auto max-w-md px-4 pb-4 pointer-events-auto">
          <div className="glass-card rounded-3xl px-2 py-2 flex items-center justify-between">
            {tabs.map((t) => {
              const active = location.pathname === t.to || location.pathname.startsWith(t.to + "/");
              const Icon = t.icon;
              return (
                <Link
                  key={t.to}
                  to={t.to}
                  className={cn(
                    "flex-1 flex flex-col items-center gap-0.5 py-2 rounded-2xl text-[10.5px] font-medium transition-colors",
                    active ? "text-primary" : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  <Icon className={cn("h-5 w-5", active && "drop-shadow-[0_2px_6px_oklch(0.65_0.13_200/0.6)]")} />
                  {t.label}
                </Link>
              );
            })}
          </div>
        </div>
      </nav>
    </div>
  );
}

export function SectionTitle({ children, icon: Icon, action }: { children: ReactNode; icon?: typeof Sparkles; action?: ReactNode }) {
  return (
    <div className="flex items-center justify-between mb-3 mt-2">
      <h2 className="text-[15px] font-bold tracking-tight flex items-center gap-2">
        {Icon && <Icon className="h-4 w-4 text-primary" />}
        {children}
      </h2>
      {action}
    </div>
  );
}
