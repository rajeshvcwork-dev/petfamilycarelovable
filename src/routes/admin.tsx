import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useApp } from "@/lib/store";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import {
  ArrowLeft, Building2, CheckCircle2, CreditCard, FileText, KeyRound, Loader2, LogOut,
  MessageSquare, PawPrint, Plus, Users, XCircle,
} from "lucide-react";
import {
  adminExtendSubscription, adminGetBilling, adminSavePlan, adminSetSubscriberStatus,
  type AdminAttempt, type AdminPlan, type AdminSubscriber,
} from "@/lib/billing-admin.functions";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Admin portal — PetCareBuddy" },
      { name: "description", content: "Manage PetCareBuddy subscription plans, active customers and failed payment attempts." },
      { property: "og:title", content: "Admin portal — PetCareBuddy" },
      { property: "og:description", content: "Manage subscription plans, customers and payment attempts." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Admin,
});

type Billing = {
  plans: AdminPlan[];
  subscribers: AdminSubscriber[];
  attempts: AdminAttempt[];
  gateway: { keyIdConfigured: boolean; keySecretConfigured: boolean; searchConfigured: boolean };
};

function Admin() {
  const { state, logout } = useApp();
  const navigate = useNavigate();

  const getBilling = useServerFn(adminGetBilling);
  const savePlan = useServerFn(adminSavePlan);
  const setStatus = useServerFn(adminSetSubscriberStatus);
  const extend = useServerFn(adminExtendSubscription);

  const [passcode, setPasscode] = useState("");
  const [unlocked, setUnlocked] = useState(false);
  const [loading, setLoading] = useState(false);
  const [billing, setBilling] = useState<Billing | null>(null);

  useEffect(() => {
    if (state.currentUserId !== "u_admin") navigate({ to: "/auth" });
  }, [state.currentUserId, navigate]);

  if (state.currentUserId !== "u_admin") return null;

  async function refresh(code = passcode) {
    setLoading(true);
    try {
      const data = await getBilling({ data: { passcode: code } });
      setBilling(data);
      setUnlocked(true);
    } catch (err) {
      setUnlocked(false);
      toast.error(err instanceof Error ? err.message : "Could not unlock billing.");
    } finally {
      setLoading(false);
    }
  }

  const stats = [
    { label: "Users", value: state.users.length, icon: Users },
    { label: "Pets", value: state.pets.length, icon: PawPrint },
    { label: "Records", value: state.records.length, icon: FileText },
    { label: "Providers", value: state.vets.length, icon: Building2 },
    { label: "Reviews", value: state.reviews.length, icon: MessageSquare },
  ];

  const active = billing?.subscribers.filter((s) => s.status === "active") ?? [];
  const inactive = billing?.subscribers.filter((s) => s.status !== "active") ?? [];
  const failed = billing?.attempts.filter((a) => a.status !== "paid") ?? [];

  return (
    <div className="min-h-screen px-4 py-6 mx-auto max-w-3xl">
      <header className="flex items-center justify-between mb-5">
        <Link to="/auth" className="h-9 w-9 grid place-items-center rounded-full hover:bg-muted"><ArrowLeft className="h-4 w-4" /></Link>
        <h1 className="font-bold">Admin Portal</h1>
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
        <h2 className="text-sm font-bold mb-2 flex items-center gap-1.5"><CreditCard className="h-4 w-4 text-primary" />Subscriptions & payments</h2>

        {!unlocked ? (
          <form
            onSubmit={(e) => { e.preventDefault(); void refresh(); }}
            className="rounded-2xl bg-card border border-border p-4 space-y-3"
          >
            <div className="text-[12.5px] text-muted-foreground flex items-start gap-2">
              <KeyRound className="h-4 w-4 mt-0.5 text-primary shrink-0" />
              Enter the admin passcode to open subscription management, customer records and payment attempts.
            </div>
            <input
              type="password"
              value={passcode}
              onChange={(e) => setPasscode(e.target.value)}
              maxLength={200}
              placeholder="Admin passcode"
              className="w-full h-11 rounded-2xl border border-border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-primary/40"
            />
            <button disabled={loading || !passcode} className="w-full h-11 rounded-2xl gradient-teal text-white text-[13px] font-semibold inline-flex items-center justify-center gap-2 disabled:opacity-60">
              {loading && <Loader2 className="h-4 w-4 animate-spin" />} Unlock
            </button>
          </form>
        ) : billing ? (
          <div className="space-y-4">
            <div className="rounded-2xl bg-card border border-border p-4">
              <div className="text-[12px] font-semibold mb-2">Payment gateway</div>
              <div className="grid gap-1.5 text-[12px]">
                <GatewayRow label="Razorpay Key ID" ok={billing.gateway.keyIdConfigured} />
                <GatewayRow label="Razorpay Key Secret" ok={billing.gateway.keySecretConfigured} />
                <GatewayRow label="Google provider search key" ok={billing.gateway.searchConfigured} />
              </div>
              <p className="text-[11px] text-muted-foreground mt-2">Keys are stored securely on the server and never shown in the app.</p>
            </div>

            <div className="space-y-2">
              <div className="text-[12px] font-semibold">Plans</div>
              {billing.plans.map((p) => (
                <PlanEditor
                  key={p.code}
                  plan={p}
                  onSave={async (patch) => {
                    try {
                      await savePlan({ data: { passcode, code: p.code as "single" | "family", ...patch } });
                      toast.success("Plan updated");
                      await refresh();
                    } catch (err) {
                      toast.error(err instanceof Error ? err.message : "Could not save plan");
                    }
                  }}
                />
              ))}
            </div>

            <SubscriberList
              title={`Active customers (${active.length})`}
              rows={active}
              onDeactivate={async (id) => {
                try {
                  await setStatus({ data: { passcode, id, status: "inactive" } });
                  toast.success("Subscription deactivated");
                  await refresh();
                } catch (err) { toast.error(err instanceof Error ? err.message : "Failed"); }
              }}
              onExtend={async (id, days) => {
                try {
                  await extend({ data: { passcode, id, days } });
                  toast.success(`Extended by ${days} days`);
                  await refresh();
                } catch (err) { toast.error(err instanceof Error ? err.message : "Failed"); }
              }}
            />

            <SubscriberList
              title={`Inactive customers (${inactive.length})`}
              rows={inactive}
              onActivate={async (id) => {
                try {
                  await setStatus({ data: { passcode, id, status: "active" } });
                  toast.success("Subscription activated");
                  await refresh();
                } catch (err) { toast.error(err instanceof Error ? err.message : "Failed"); }
              }}
              onExtend={async (id, days) => {
                try {
                  await extend({ data: { passcode, id, days } });
                  toast.success(`Extended by ${days} days`);
                  await refresh();
                } catch (err) { toast.error(err instanceof Error ? err.message : "Failed"); }
              }}
            />

            <div>
              <div className="text-[12px] font-semibold mb-2">Failed / abandoned payments ({failed.length})</div>
              <div className="rounded-2xl bg-card border border-border overflow-hidden">
                {failed.map((a, i) => (
                  <div key={a.id} className={`px-4 py-3 ${i ? "border-t border-border" : ""}`}>
                    <div className="flex items-center justify-between gap-2">
                      <div className="min-w-0">
                        <div className="text-[13px] font-semibold truncate">{a.fullName || a.email}</div>
                        <div className="text-[11.5px] text-muted-foreground truncate">{a.email}{a.mobile ? ` · ${a.mobile}` : ""}</div>
                      </div>
                      <span className="pill bg-destructive/10 text-destructive shrink-0">{a.status}</span>
                    </div>
                    <div className="text-[11px] text-muted-foreground mt-1">
                      {a.planCode} · ₹{(a.amountPaise / 100).toLocaleString()} · {new Date(a.createdAt).toLocaleString()}
                      {a.failureReason ? ` · ${a.failureReason}` : ""}
                    </div>
                  </div>
                ))}
                {failed.length === 0 && <div className="px-4 py-6 text-center text-[12.5px] text-muted-foreground">No failed attempts.</div>}
              </div>
            </div>
          </div>
        ) : null}
      </section>

      <section className="mt-6">
        <h2 className="text-sm font-bold mb-2">App users</h2>
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

      <p className="text-center text-[11px] text-muted-foreground mt-8">PetCareBuddy admin</p>
    </div>
  );
}

function GatewayRow({ label, ok }: { label: string; ok: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-muted-foreground">{label}</span>
      <span className={`inline-flex items-center gap-1 font-semibold ${ok ? "text-success" : "text-destructive"}`}>
        {ok ? <CheckCircle2 className="h-3.5 w-3.5" /> : <XCircle className="h-3.5 w-3.5" />}
        {ok ? "Saved" : "Not set"}
      </span>
    </div>
  );
}

function PlanEditor({ plan, onSave }: { plan: AdminPlan; onSave: (patch: { name: string; description?: string; amountPaise: number; periodDays: number; petLimit: number; isActive: boolean }) => Promise<void> }) {
  const [name, setName] = useState(plan.name);
  const [rupees, setRupees] = useState(String(plan.amountPaise / 100));
  const [periodDays, setPeriodDays] = useState(String(plan.periodDays));
  const [petLimit, setPetLimit] = useState(String(plan.petLimit));
  const [isActive, setIsActive] = useState(plan.isActive);
  const [saving, setSaving] = useState(false);

  return (
    <div className="rounded-2xl bg-card border border-border p-4 space-y-2">
      <div className="flex items-center justify-between">
        <span className="pill bg-primary/10 text-primary">{plan.code}</span>
        <label className="text-[12px] inline-flex items-center gap-2">
          <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} /> Available
        </label>
      </div>
      <Field label="Plan name" value={name} onChange={setName} />
      <div className="grid grid-cols-3 gap-2">
        <Field label="Price (₹)" value={rupees} onChange={setRupees} type="number" />
        <Field label="Days" value={periodDays} onChange={setPeriodDays} type="number" />
        <Field label="Pet limit" value={petLimit} onChange={setPetLimit} type="number" />
      </div>
      <button
        disabled={saving}
        onClick={async () => {
          const amount = Math.round(Number(rupees) * 100);
          const days = Number(periodDays);
          const pets = Number(petLimit);
          if (!name.trim() || !Number.isFinite(amount) || amount < 0 || days < 1 || pets < 1) {
            return toast.error("Check the plan values");
          }
          setSaving(true);
          await onSave({ name: name.trim(), amountPaise: amount, periodDays: days, petLimit: pets, isActive });
          setSaving(false);
        }}
        className="w-full h-10 rounded-2xl gradient-teal text-white text-[13px] font-semibold inline-flex items-center justify-center gap-2 disabled:opacity-60"
      >
        {saving && <Loader2 className="h-4 w-4 animate-spin" />} Save plan
      </button>
    </div>
  );
}

function Field({ label, value, onChange, type = "text" }: { label: string; value: string; onChange: (v: string) => void; type?: string }) {
  return (
    <label className="block">
      <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">{label}</span>
      <input type={type} value={value} onChange={(e) => onChange(e.target.value)} className="mt-1 w-full h-10 rounded-xl border border-border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-primary/40" />
    </label>
  );
}

function SubscriberList({ title, rows, onActivate, onDeactivate, onExtend }: {
  title: string;
  rows: AdminSubscriber[];
  onActivate?: (id: string) => Promise<void>;
  onDeactivate?: (id: string) => Promise<void>;
  onExtend: (id: string, days: number) => Promise<void>;
}) {
  return (
    <div>
      <div className="text-[12px] font-semibold mb-2">{title}</div>
      <div className="rounded-2xl bg-card border border-border overflow-hidden">
        {rows.map((s, i) => (
          <div key={s.id} className={`px-4 py-3 ${i ? "border-t border-border" : ""}`}>
            <div className="flex items-center justify-between gap-2">
              <div className="min-w-0">
                <div className="text-[13px] font-semibold truncate">{s.fullName || s.email}</div>
                <div className="text-[11.5px] text-muted-foreground truncate">{s.email}{s.mobile ? ` · ${s.mobile}` : ""}</div>
              </div>
              <span className={`pill shrink-0 ${s.status === "active" ? "bg-success/15 text-success" : "bg-muted text-muted-foreground"}`}>{s.status}</span>
            </div>
            <div className="text-[11px] text-muted-foreground mt-1">
              {s.planCode} · expires {new Date(s.expiresAt).toLocaleDateString()}
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              {[30, 90, 365].map((d) => (
                <button key={d} onClick={() => void onExtend(s.id, d)} className="pill bg-primary/10 text-primary">
                  <Plus className="h-3 w-3" />{d}d
                </button>
              ))}
              {onDeactivate && (
                <button onClick={() => void onDeactivate(s.id)} className="pill bg-destructive/10 text-destructive">Deactivate</button>
              )}
              {onActivate && (
                <button onClick={() => void onActivate(s.id)} className="pill bg-success/15 text-success">Activate</button>
              )}
            </div>
          </div>
        ))}
        {rows.length === 0 && <div className="px-4 py-6 text-center text-[12.5px] text-muted-foreground">No customers here yet.</div>}
      </div>
    </div>
  );
}
