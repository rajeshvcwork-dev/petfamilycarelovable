import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { AppShell, SectionTitle } from "@/components/AppShell";
import { useApp, useCurrentUser } from "@/lib/store";
import { ChevronRight, CreditCard, FileText, LogOut, Moon, Shield, ShieldCheck, Sun, User } from "lucide-react";
import { useEffect } from "react";

export const Route = createFileRoute("/settings")({
  head: () => ({ meta: [{ title: "Settings — PetCareBuddy" }] }),
  component: Settings,
});

function Settings() {
  const user = useCurrentUser();
  const { state, toggleDark, logout } = useApp();
  const navigate = useNavigate();
  useEffect(() => { if (!state.currentUserId) navigate({ to: "/auth" }); }, [state.currentUserId, navigate]);
  if (!user) return null;

  return (
    <AppShell title="Settings">
      <div className="rounded-3xl bg-card border border-border p-4 flex items-center gap-3">
        <div className="h-12 w-12 rounded-2xl gradient-teal text-white grid place-items-center text-lg font-bold">
          {user.fullName.split(" ").map((s) => s[0]).slice(0, 2).join("")}
        </div>
        <div className="flex-1">
          <div className="font-bold">{user.fullName}</div>
          <div className="text-[12px] text-muted-foreground">{user.email}</div>
          <div className="text-[11.5px] text-muted-foreground">{user.mobile}</div>
        </div>
      </div>

      <SectionTitle icon={CreditCard}>Subscription</SectionTitle>
      <div className="rounded-2xl bg-card border border-border p-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="font-bold text-sm">{user.plan === "family" ? "Family Plan" : "Individual Plan"}</div>
            <div className="text-[12px] text-muted-foreground">{user.plan === "family" ? "Up to 4 pets" : "1 pet"} · Active</div>
          </div>
          <span className="pill bg-success/15 text-success"><ShieldCheck className="h-3 w-3" />Active</span>
        </div>
        <div className="text-[11.5px] text-muted-foreground mt-2">Renews on {new Date(Date.now() + 86400000 * 60).toLocaleDateString()}</div>
        <div className="grid grid-cols-2 gap-2 mt-3">
          <button className="h-10 rounded-2xl bg-card border border-border text-[13px] font-semibold">Manage</button>
          <button className="h-10 rounded-2xl gradient-teal text-white text-[13px] font-semibold">Upgrade</button>
        </div>
      </div>

      <SectionTitle>Account</SectionTitle>
      <div className="rounded-2xl bg-card border border-border divide-y divide-border overflow-hidden">
        <Row icon={User} label="Profile" hint="Edit name, mobile, email" onClick={() => {}} />
        <Row icon={state.darkMode ? Sun : Moon} label={state.darkMode ? "Light mode" : "Dark mode"} hint="Switch app theme" onClick={toggleDark} />
        <Row icon={Shield} label="Security" hint="Encryption · Sign-in protection" onClick={() => {}} />
      </div>

      <SectionTitle>Legal</SectionTitle>
      <div className="rounded-2xl bg-card border border-border divide-y divide-border overflow-hidden">
        <RowLink to="/legal/privacy" icon={Shield} label="Privacy Policy" />
        <RowLink to="/legal/data" icon={FileText} label="Data & Storage Policy" />
        <RowLink to="/legal/terms" icon={FileText} label="Terms & Conditions" />
      </div>

      <button onClick={() => { logout(); navigate({ to: "/auth" }); }} className="mt-4 w-full h-11 rounded-2xl bg-destructive/10 text-destructive font-semibold inline-flex items-center justify-center gap-2">
        <LogOut className="h-4 w-4" /> Sign out
      </button>

      <p className="text-center text-[11px] text-muted-foreground mt-4">PetCareBuddy v1.0 · Made with care</p>
    </AppShell>
  );
}

function Row({ icon: Icon, label, hint, onClick }: { icon: React.ComponentType<{ className?: string }>; label: string; hint?: string; onClick: () => void }) {
  return (
    <button onClick={onClick} className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-muted/50">
      <div className="h-9 w-9 rounded-xl bg-primary/10 text-primary grid place-items-center"><Icon className="h-4.5 w-4.5" /></div>
      <div className="flex-1">
        <div className="text-[13.5px] font-semibold">{label}</div>
        {hint && <div className="text-[11.5px] text-muted-foreground">{hint}</div>}
      </div>
      <ChevronRight className="h-4 w-4 text-muted-foreground" />
    </button>
  );
}

function RowLink({ to, icon: Icon, label }: { to: string; icon: React.ComponentType<{ className?: string }>; label: string }) {
  return (
    <Link to={to} className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-muted/50">
      <div className="h-9 w-9 rounded-xl bg-primary/10 text-primary grid place-items-center"><Icon className="h-4.5 w-4.5" /></div>
      <div className="flex-1 text-[13.5px] font-semibold">{label}</div>
      <ChevronRight className="h-4 w-4 text-muted-foreground" />
    </Link>
  );
}
