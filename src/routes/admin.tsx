import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useApp } from "@/lib/store";
import { useEffect } from "react";
import { ArrowLeft, Building2, FileText, LogOut, MessageSquare, PawPrint, Users } from "lucide-react";

export const Route = createFileRoute("/admin")({
  head: () => ({ meta: [{ title: "Admin — PetCareBuddy" }] }),
  component: Admin,
});

function Admin() {
  const { state, logout } = useApp();
  const navigate = useNavigate();

  useEffect(() => {
    if (state.currentUserId !== "u_admin") navigate({ to: "/auth" });
  }, [state.currentUserId, navigate]);

  if (state.currentUserId !== "u_admin") return null;

  const stats = [
    { label: "Users", value: state.users.length, icon: Users },
    { label: "Pets", value: state.pets.length, icon: PawPrint },
    { label: "Records", value: state.records.length, icon: FileText },
    { label: "Providers", value: state.vets.length, icon: Building2 },
    { label: "Reviews", value: state.reviews.length, icon: MessageSquare },
  ];

  return (
    <div className="min-h-screen px-4 py-6 mx-auto max-w-3xl">
      <header className="flex items-center justify-between mb-5">
        <Link to="/auth" className="h-9 w-9 grid place-items-center rounded-full hover:bg-muted"><ArrowLeft className="h-4 w-4" /></Link>
        <div className="font-bold">Admin Portal</div>
        <button onClick={() => { logout(); navigate({ to: "/auth" }); }} className="h-9 w-9 grid place-items-center rounded-full hover:bg-muted text-muted-foreground"><LogOut className="h-4 w-4" /></button>
      </header>

      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {stats.map((s) => (
          <div key={s.label} className="rounded-2xl bg-card border border-border p-4">
            <div className="h-9 w-9 rounded-xl bg-primary/10 text-primary grid place-items-center mb-2"><s.icon className="h-5 w-5" /></div>
            <div className="text-2xl font-extrabold">{s.value}</div>
            <div className="text-[12px] text-muted-foreground">{s.label}</div>
          </div>
        ))}
      </div>

      <section className="mt-6">
        <h2 className="text-sm font-bold mb-2">Users</h2>
        <div className="rounded-2xl bg-card border border-border overflow-hidden">
          {state.users.map((u, i) => (
            <div key={u.id} className={`px-4 py-3 flex items-center gap-3 ${i ? "border-t border-border" : ""}`}>
              <div className="h-9 w-9 rounded-full gradient-teal text-white grid place-items-center text-xs font-bold">
                {u.fullName.split(" ").map((s) => s[0]).slice(0, 2).join("")}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[13.5px] font-semibold truncate">{u.fullName}</div>
                <div className="text-[11.5px] text-muted-foreground truncate">{u.email} · {u.plan}</div>
              </div>
              <span className="pill bg-muted text-muted-foreground">{u.id === "u_admin" ? "Admin" : "User"}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-6">
        <h2 className="text-sm font-bold mb-2">Providers</h2>
        <div className="rounded-2xl bg-card border border-border overflow-hidden">
          {state.vets.map((v, i) => (
            <div key={v.id} className={`px-4 py-3 flex items-center gap-3 ${i ? "border-t border-border" : ""}`}>
              <div className="h-9 w-9 rounded-xl bg-primary/10 text-primary grid place-items-center"><Building2 className="h-4.5 w-4.5" /></div>
              <div className="flex-1 min-w-0">
                <div className="text-[13.5px] font-semibold truncate">{v.name}</div>
                <div className="text-[11.5px] text-muted-foreground truncate">{v.city}, {v.country} · {v.kind}</div>
              </div>
              <span className="pill bg-warning/15 text-warning-foreground">{v.rating}★</span>
            </div>
          ))}
        </div>
      </section>

      <p className="text-center text-[11px] text-muted-foreground mt-8">PetCareBuddy admin · read-only demo</p>
    </div>
  );
}
