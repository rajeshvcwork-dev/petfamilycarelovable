import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { AppShell, SectionTitle } from "@/components/AppShell";
import { useApp } from "@/lib/store";
import { Bell, Calendar, CheckCheck, CreditCard, Pill, ShieldCheck, Sparkles } from "lucide-react";
import { useEffect } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/notifications")({
  head: () => ({ meta: [{ title: "Notifications — PetCareBuddy" }] }),
  component: NotifPage,
});

const ICONS = {
  vaccination: ShieldCheck,
  spotOn: Pill,
  medication: Pill,
  appointment: Calendar,
  subscription: CreditCard,
  insight: Sparkles,
} as const;

function NotifPage() {
  const { state, markRead, clearNotifications } = useApp();
  const navigate = useNavigate();
  useEffect(() => { if (!state.currentUserId) navigate({ to: "/auth" }); }, [state.currentUserId, navigate]);

  const items = state.notifications.slice().sort((a, b) => +new Date(b.date) - +new Date(a.date));

  return (
    <AppShell title="Notifications">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Bell className="h-4 w-4 text-primary" />
          <div className="text-[13px] font-semibold">{items.filter((i) => !i.read).length} unread</div>
        </div>
        <button onClick={() => { clearNotifications(); toast.success("All marked as read"); }} className="text-[12px] font-semibold text-primary inline-flex items-center gap-1">
          <CheckCheck className="h-4 w-4" /> Mark all read
        </button>
      </div>

      <SectionTitle>All</SectionTitle>
      <div className="space-y-2">
        {items.map((n) => {
          const Icon = ICONS[n.type] || Bell;
          return (
            <button key={n.id} onClick={() => markRead(n.id)} className={`w-full text-left rounded-2xl border p-3 transition ${n.read ? "bg-card border-border" : "bg-primary/5 border-primary/20"}`}>
              <div className="flex items-start gap-3">
                <div className={`h-10 w-10 rounded-xl grid place-items-center ${n.read ? "bg-muted text-muted-foreground" : "bg-primary/10 text-primary"}`}>
                  <Icon className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <div className="text-[13.5px] font-semibold truncate">{n.title}</div>
                    {!n.read && <span className="h-2 w-2 rounded-full bg-primary shrink-0" />}
                  </div>
                  <div className="text-[12px] text-muted-foreground">{n.body}</div>
                  <div className="text-[10.5px] text-muted-foreground mt-1">{new Date(n.date).toLocaleString()}</div>
                </div>
              </div>
            </button>
          );
        })}
        {items.length === 0 && <div className="rounded-2xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">No notifications yet.</div>}
      </div>
    </AppShell>
  );
}
