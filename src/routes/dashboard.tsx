import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useApp, useCurrentUser, useUserPets } from "@/lib/store";
import { AppShell, SectionTitle } from "@/components/AppShell";
import { ScoreRing } from "@/components/ScoreRing";
import { ArrowRight, Calendar, FileText, HeartPulse, MapPin, PawPrint, Plus, ShieldCheck, Sparkles } from "lucide-react";
import { useEffect } from "react";

export const Route = createFileRoute("/dashboard")({
  head: () => ({ meta: [{ title: "Dashboard — PetCare Family" }] }),
  component: Dashboard,
});

function Dashboard() {
  const user = useCurrentUser();
  const pets = useUserPets();
  const { state } = useApp();
  const navigate = useNavigate();

  useEffect(() => {
    if (!state.currentUserId) navigate({ to: "/auth" });
  }, [state.currentUserId, navigate]);

  if (!user) return null;

  const upcoming = state.notifications.filter((n) => !n.read).slice(0, 2);
  const recentRecords = state.records.filter((r) => pets.some((p) => p.id === r.petId)).slice(0, 3);

  return (
    <AppShell>
      {/* Hero */}
      <section className="rounded-3xl p-5 text-white gradient-teal shadow-card relative overflow-hidden">
        <div className="absolute -right-6 -top-6 h-32 w-32 rounded-full bg-white/15 blur-2xl" />
        <div className="absolute -right-2 -bottom-10 h-40 w-40 rounded-full bg-black/10 blur-2xl" />
        <div className="relative flex items-center justify-between">
          <div>
            <div className="text-[11px] uppercase tracking-wider opacity-90">{user.location || "Pet Parent"}</div>
            <h1 className="text-xl font-extrabold mt-0.5">Hello, {user.fullName.split(" ")[0]}</h1>
            <p className="text-[12.5px] opacity-90 mt-1">{pets.length} active pets · {user.plan === "family" ? "Family" : "Individual"} plan</p>
          </div>
          <Link to="/pets" className="rounded-2xl bg-white/15 backdrop-blur px-3 py-2 text-[12px] font-semibold inline-flex items-center gap-1.5">
            <PawPrint className="h-4 w-4" /> Pets
          </Link>
        </div>

        <div className="relative mt-4 grid grid-cols-3 gap-2">
          <Stat label="Pets" value={pets.length} />
          <Stat label="Records" value={state.records.length} />
          <Stat label="Alerts" value={state.notifications.filter((n) => !n.read).length} />
        </div>
      </section>

      {/* Quick actions */}
      <section className="grid grid-cols-4 gap-2 mt-4">
        <QuickAction to="/records" icon={FileText} label="Records" />
        <QuickAction to="/vets" icon={MapPin} label="Find vet" />
        <QuickAction to="/notifications" icon={Calendar} label="Schedule" />
        <QuickAction to="/support" icon={Sparkles} label="Support" />
      </section>

      {/* Pet scores */}
      <SectionTitle icon={HeartPulse} action={<Link to="/pets" className="text-[12px] font-semibold text-primary inline-flex items-center gap-1">All pets <ArrowRight className="h-3 w-3" /></Link>}>
        Pet Health & Wellness
      </SectionTitle>
      <div className="space-y-3">
        {pets.map((p) => (
          <Link key={p.id} to="/pets/$petId" params={{ petId: p.id }} className="block">
            <div className="rounded-3xl bg-card border border-border p-4 shadow-soft active:scale-[0.99] transition">
              <div className="flex items-center gap-4">
                <div className="h-14 w-14 rounded-2xl bg-accent grid place-items-center text-2xl">
                  {p.species === "Cat" ? "🐱" : p.species === "Dog" ? "🐶" : "🐾"}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <div className="font-bold">{p.name}</div>
                    {p.vaccinated ? (
                      <span className="pill bg-success/15 text-success"><ShieldCheck className="h-3 w-3" />Vaccinated</span>
                    ) : (
                      <span className="pill bg-warning/15 text-warning-foreground">Vaccination pending</span>
                    )}
                  </div>
                  <div className="text-[12px] text-muted-foreground">{p.breed} · {p.gender} · {p.ageYears}y · {p.weightKg}kg</div>
                  <div className="flex gap-3 mt-2">
                    <Bar label="Health" value={p.healthScore} tone="primary" />
                    <Bar label="Wellness" value={p.wellnessScore} tone="info" />
                  </div>
                </div>
                <ScoreRing value={p.healthScore} size={56} tone={p.healthScore >= 85 ? "success" : p.healthScore >= 70 ? "primary" : "warning"} />
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Upcoming */}
      {upcoming.length > 0 && (
        <>
          <SectionTitle icon={Calendar}>Upcoming</SectionTitle>
          <div className="space-y-2">
            {upcoming.map((n) => (
              <Link key={n.id} to="/notifications" className="block rounded-2xl bg-card border border-border p-3">
                <div className="flex items-start gap-3">
                  <div className="h-9 w-9 rounded-xl bg-primary/10 text-primary grid place-items-center">
                    <Calendar className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[13px] font-semibold">{n.title}</div>
                    <div className="text-[11.5px] text-muted-foreground">{n.body}</div>
                  </div>
                  <div className="text-[10.5px] text-muted-foreground">{new Date(n.date).toLocaleDateString()}</div>
                </div>
              </Link>
            ))}
          </div>
        </>
      )}

      {/* Recent records */}
      <SectionTitle icon={FileText} action={<Link to="/records" className="text-[12px] font-semibold text-primary inline-flex items-center gap-1">All <ArrowRight className="h-3 w-3" /></Link>}>
        Recent records
      </SectionTitle>
      <div className="space-y-2">
        {recentRecords.length === 0 && <EmptyMini text="No records yet. Tap + to add one." />}
        {recentRecords.map((r) => {
          const pet = pets.find((p) => p.id === r.petId);
          return (
            <div key={r.id} className="rounded-2xl bg-card border border-border p-3 flex items-center gap-3">
              <div className="h-9 w-9 rounded-xl bg-info/10 text-info grid place-items-center">
                <FileText className="h-4 w-4" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[13px] font-semibold truncate">{r.title}</div>
                <div className="text-[11.5px] text-muted-foreground">{pet?.name} · {new Date(r.date).toLocaleDateString()}</div>
              </div>
              <span className="pill bg-muted text-muted-foreground">{r.type}</span>
            </div>
          );
        })}
      </div>

      <div className="mt-6">
        <Link to="/pets" className="block rounded-2xl border-2 border-dashed border-border p-4 text-center text-[13px] text-muted-foreground hover:bg-muted/50">
          <Plus className="inline h-4 w-4 mr-1" /> Add a new pet
        </Link>
      </div>
    </AppShell>
  );
}

function Stat({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="rounded-2xl bg-white/15 backdrop-blur px-3 py-2 text-center">
      <div className="text-lg font-extrabold leading-none">{value}</div>
      <div className="text-[10.5px] opacity-90 mt-1">{label}</div>
    </div>
  );
}

function QuickAction({ to, icon: Icon, label }: { to: string; icon: React.ComponentType<{ className?: string }>; label: string }) {
  return (
    <Link to={to} className="flex flex-col items-center gap-1.5 rounded-2xl bg-card border border-border p-3 active:scale-[0.97] transition shadow-soft">
      <div className="h-9 w-9 rounded-xl bg-primary/10 text-primary grid place-items-center">
        <Icon className="h-4.5 w-4.5" />
      </div>
      <span className="text-[11px] font-semibold">{label}</span>
    </Link>
  );
}

function Bar({ label, value, tone }: { label: string; value: number; tone: "primary" | "info" }) {
  const cls = tone === "info" ? "bg-info" : "bg-primary";
  return (
    <div className="flex-1">
      <div className="flex justify-between text-[10.5px] mb-1">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-bold">{value}</span>
      </div>
      <div className="h-1.5 rounded-full bg-muted overflow-hidden">
        <div className={`h-full ${cls} rounded-full`} style={{ width: `${value}%` }} />
      </div>
    </div>
  );
}

function EmptyMini({ text }: { text: string }) {
  return <div className="rounded-2xl border border-dashed border-border p-4 text-center text-[12.5px] text-muted-foreground">{text}</div>;
}
