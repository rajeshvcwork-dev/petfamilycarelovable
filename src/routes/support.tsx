import { createFileRoute } from "@tanstack/react-router";
import { AppShell, SectionTitle } from "@/components/AppShell";
import { useState } from "react";
import { Send, Sparkles } from "lucide-react";

export const Route = createFileRoute("/support")({
  head: () => ({ meta: [{ title: "Support — PetCareBuddy" }] }),
  component: SupportPage,
});

type Msg = { id: string; from: "you" | "ai"; text: string };

const QUICK = [
  "How do I add a new pet?",
  "How do I upload a medical record?",
  "What are the subscription plans?",
  "How do vaccination reminders work?",
  "How do I reset my password?",
  "How do I find a vet near me?",
];

function aiReply(q: string): string {
  const t = q.toLowerCase();
  if (t.includes("password")) return "Tap Forgot password on the sign-in screen. We'll email you a reset link. The link is valid for 30 minutes.";
  if (t.includes("add") && t.includes("pet")) return "Open the Pets tab and tap Add. Enter your pet's details and tap Save — you can edit or upload a photo afterwards.";
  if (t.includes("upload") || t.includes("record")) return "Go to Records → Add, or open a pet profile and tap Upload. PDF, JPG and PNG files up to 20 MB are supported.";
  if (t.includes("subscription") || t.includes("plan")) return "Individual covers 1 pet. Family covers up to 4 pets. Manage your plan in Settings → Subscription.";
  if (t.includes("vaccin")) return "We track vaccination dates per pet and send reminders 7 and 1 days before due. You can review all upcoming reminders in the Notifications screen.";
  if (t.includes("vet") || t.includes("clinic") || t.includes("doctor")) return "Open Vets tab. Filter by country and kind, search by name or specialty, then tap Call or Directions on any provider.";
  if (t.includes("delete") || t.includes("remove")) return "On any pet or record, tap the trash icon. You will be asked to confirm. Deleted items cannot be recovered.";
  return "Thanks for reaching out. A real team member typically replies within 4 hours. In the meantime, try one of the suggested topics below.";
}

function SupportPage() {
  const [messages, setMessages] = useState<Msg[]>([
    { id: "m1", from: "ai", text: "Hi! I'm the PetCareBuddy assistant. Ask me anything about your pets, records or your account." },
  ]);
  const [input, setInput] = useState("");

  const send = (text: string) => {
    if (!text.trim()) return;
    const id = Math.random().toString(36).slice(2);
    setMessages((m) => [...m, { id, from: "you", text }]);
    setInput("");
    setTimeout(() => {
      setMessages((m) => [...m, { id: id + "r", from: "ai", text: aiReply(text) }]);
    }, 450);
  };

  return (
    <AppShell title="Support">
      <div className="rounded-3xl border border-primary/20 bg-primary/5 p-4 flex items-center gap-3">
        <div className="h-10 w-10 rounded-2xl gradient-teal grid place-items-center text-white">
          <Sparkles className="h-5 w-5" />
        </div>
        <div>
          <div className="font-bold text-sm">AI Customer Support</div>
          <div className="text-[12px] text-muted-foreground">Instant answers · Available 24/7</div>
        </div>
      </div>

      <SectionTitle>Conversation</SectionTitle>
      <div className="space-y-2 mb-3">
        {messages.map((m) => (
          <div key={m.id} className={`max-w-[85%] rounded-2xl px-3 py-2 text-[13px] ${m.from === "you" ? "ml-auto bg-primary text-primary-foreground" : "bg-card border border-border"}`}>
            {m.text}
          </div>
        ))}
      </div>

      <div className="flex gap-2 overflow-x-auto -mx-4 px-4 pb-2">
        {QUICK.map((q) => (
          <button key={q} onClick={() => send(q)} className="shrink-0 px-3 h-8 rounded-full text-[12px] font-semibold bg-card border border-border hover:bg-muted">
            {q}
          </button>
        ))}
      </div>

      <form onSubmit={(e) => { e.preventDefault(); send(input); }} className="sticky bottom-24 mt-3 flex items-center gap-2">
        <input value={input} onChange={(e) => setInput(e.target.value)} placeholder="Type a message…" className="flex-1 h-11 rounded-2xl border border-border bg-card px-3 text-sm outline-none focus:ring-2 focus:ring-primary/40" />
        <button type="submit" className="h-11 w-11 rounded-2xl gradient-teal text-white grid place-items-center">
          <Send className="h-4 w-4" />
        </button>
      </form>
    </AppShell>
  );
}
