import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { AppShell, SectionTitle } from "@/components/AppShell";
import { useApp, useCurrentUser } from "@/lib/store";
import { ChevronRight, CreditCard, FileText, Loader2, LogOut, Moon, Pencil, Shield, ShieldCheck, Sparkles, Sun, User, X } from "lucide-react";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  confirmSubscriptionPayment,
  createSubscriptionOrder,
  failSubscriptionAttempt,
  getCheckoutConfig,
} from "@/lib/billing.functions";
import { loadRazorpay, openRazorpayCheckout } from "@/lib/razorpay";

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [
      { title: "Settings & subscription — PetCare Family" },
      { name: "description", content: "Manage your PetCare Family profile, theme and pet care subscription plan." },
      { property: "og:title", content: "Settings & subscription — PetCare Family" },
      { property: "og:description", content: "Manage your profile, theme and pet care subscription plan." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Settings,
});

function Settings() {
  const user = useCurrentUser();
  const { state, toggleDark, logout, setPlan, updateProfile } = useApp();
  const navigate = useNavigate();
  useEffect(() => { if (!state.currentUserId) navigate({ to: "/auth" }); }, [state.currentUserId, navigate]);

  const fetchConfig = useServerFn(getCheckoutConfig);
  const createOrder = useServerFn(createSubscriptionOrder);
  const confirmPayment = useServerFn(confirmSubscriptionPayment);
  const failAttempt = useServerFn(failSubscriptionAttempt);
  const [busy, setBusy] = useState(false);

  const { data: config } = useQuery({ queryKey: ["checkout-config"], queryFn: () => fetchConfig() });
  const familyPlan = config?.plans.find((p) => p.code === "family");
  const isFamily = user?.plan === "family";

  async function upgrade() {
    if (!user) return;
    if (!config?.configured) return toast.error("Payments aren’t connected yet. Add your Razorpay keys first.");
    setBusy(true);
    try {
      const ok = await loadRazorpay();
      if (!ok) throw new Error("checkout script");
      const order = await createOrder({
        data: { planCode: "family", fullName: user.fullName, email: user.email, mobile: user.mobile },
      });
      openRazorpayCheckout({
        keyId: order.keyId,
        orderId: order.orderId,
        amount: order.amount,
        currency: order.currency,
        planName: order.planName,
        name: user.fullName,
        email: user.email,
        mobile: user.mobile,
        onSuccess: async (res) => {
          try {
            await confirmPayment({
              data: {
                attemptId: order.attemptId,
                razorpayOrderId: res.razorpay_order_id,
                razorpayPaymentId: res.razorpay_payment_id,
                razorpaySignature: res.razorpay_signature,
              },
            });
            setPlan("family");
            toast.success("Family Plan activated — up to 4 pet profiles");
          } catch {
            toast.error("We couldn’t verify that payment. Support has been notified.");
          }
        },
        onDismiss: () => {
          void failAttempt({ data: { attemptId: order.attemptId, reason: "Checkout closed before payment" } });
          toast.info("Checkout cancelled");
        },
      });
    } catch {
      toast.error("Could not start checkout. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  if (!user) return null;

  return (
    <AppShell title="Settings">
      <div className="rounded-3xl bg-card border border-border p-4 flex items-center gap-3">
        <div className="h-12 w-12 rounded-2xl gradient-teal text-white grid place-items-center text-lg font-bold">
          {user.fullName.split(" ").map((s) => s[0]).slice(0, 2).join("")}
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-bold truncate">{user.fullName}</div>
          <div className="text-[12px] text-muted-foreground truncate">{user.email}</div>
          <div className="text-[11.5px] text-muted-foreground">{user.mobile}</div>
        </div>
        <button onClick={() => setEditing(true)} className="h-9 px-3 rounded-full border border-border text-[12px] font-semibold inline-flex items-center gap-1.5 shrink-0">
          <Pencil className="h-3.5 w-3.5" /> Edit
        </button>
      </div>

      <SectionTitle icon={CreditCard}>Subscription</SectionTitle>
      <div className="rounded-2xl bg-card border border-border p-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="font-bold text-sm">{isFamily ? "Family Plan" : "Single Pet Plan"}</div>
            <div className="text-[12px] text-muted-foreground">{isFamily ? "Up to 4 pet profiles" : "1 pet profile"} · Active</div>
          </div>
          <span className="pill bg-success/15 text-success"><ShieldCheck className="h-3 w-3" />Active</span>
        </div>
        <div className="text-[11.5px] text-muted-foreground mt-2">Renews on {new Date(Date.now() + 86400000 * 60).toLocaleDateString()}</div>

        {isFamily ? (
          <div className="mt-3 rounded-xl bg-muted/50 p-3 text-[12px] text-muted-foreground">
            You’re on the highest plan — nothing more to upgrade.
          </div>
        ) : (
          <>
            <div className="mt-3 rounded-xl bg-primary/5 border border-primary/20 p-3">
              <div className="text-[12.5px] font-semibold flex items-center gap-1.5"><Sparkles className="h-3.5 w-3.5 text-primary" />Family Plan</div>
              <div className="text-[11.5px] text-muted-foreground mt-0.5">
                Maintain up to 4 pet profiles
                {familyPlan ? ` · ₹${(familyPlan.amountPaise / 100).toLocaleString()} / ${familyPlan.periodDays} days` : ""}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2 mt-3">
              <button type="button" className="h-10 rounded-2xl bg-card border border-border text-[13px] font-semibold">Manage</button>
              <button
                type="button"
                onClick={() => void upgrade()}
                disabled={busy}
                className="h-10 rounded-2xl gradient-teal text-white text-[13px] font-semibold inline-flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {busy && <Loader2 className="h-4 w-4 animate-spin" />} Upgrade
              </button>
            </div>
            {config && !config.configured && (
              <div className="text-[11px] text-muted-foreground mt-2">Payments will go live once the Razorpay keys are saved.</div>
            )}
          </>
        )}
      </div>

      <SectionTitle>Account</SectionTitle>
      <div className="rounded-2xl bg-card border border-border divide-y divide-border overflow-hidden">
        <Row icon={User} label="Profile" hint="Edit name, mobile, email" onClick={() => setEditing(true)} />
        <Row icon={state.darkMode ? Sun : Moon} label={state.darkMode ? "Light mode" : "Dark mode"} hint="Switch app theme" onClick={toggleDark} />
        <Row icon={Shield} label="Security" hint="Encryption · Sign-in protection" onClick={() => toast.info("Your records are encrypted in transit and at rest.")} />
      </div>

      <SectionTitle>Legal & policies</SectionTitle>
      <div className="rounded-2xl bg-card border border-border divide-y divide-border overflow-hidden">
        <RowLink to="/legal/privacy" icon={Shield} label="Privacy Policy" />
        <RowLink to="/legal/data" icon={Shield} label="Data Privacy & Storage Policy" />
        <RowLink to="/legal/subscription" icon={CreditCard} label="Subscription Policy" />
        <RowLink to="/legal/refund" icon={FileText} label="Refund Policy" />
        <RowLink to="/legal/cancellation" icon={FileText} label="Cancellation Policy" />
        <RowLink to="/legal/terms" icon={FileText} label="Terms & Conditions" />
      </div>

      {editing && (
        <ProfileSheet
          user={{ fullName: user.fullName, email: user.email, mobile: user.mobile, location: user.location ?? "" }}
          onClose={() => setEditing(false)}
          onSave={(data) => { updateProfile(data); setEditing(false); toast.success("Profile updated"); }}
        />
      )}


      <button onClick={() => { logout(); navigate({ to: "/auth" }); }} className="mt-4 w-full h-11 rounded-2xl bg-destructive/10 text-destructive font-semibold inline-flex items-center justify-center gap-2">
        <LogOut className="h-4 w-4" /> Sign out
      </button>

      <p className="text-center text-[11px] text-muted-foreground mt-4">PetCare Family v1.0 · Made with care</p>
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
