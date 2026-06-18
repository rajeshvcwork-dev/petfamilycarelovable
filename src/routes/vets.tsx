import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { AppShell, SectionTitle } from "@/components/AppShell";
import { useApp, useCurrentUser } from "@/lib/store";
import { Building2, MapPin, Phone, Search, Star, Stethoscope, Trash2, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import type { Vet } from "@/lib/seed";

export const Route = createFileRoute("/vets")({
  head: () => ({ meta: [{ title: "Vet directory — PetCareBuddy" }] }),
  component: VetsPage,
});

const COUNTRIES = ["All", "India", "Pakistan", "Sri Lanka", "Thailand"] as const;

function VetsPage() {
  const { state } = useApp();
  const navigate = useNavigate();
  const [q, setQ] = useState("");
  const [country, setCountry] = useState<typeof COUNTRIES[number]>("All");
  const [kind, setKind] = useState<string>("All");
  const [active, setActive] = useState<Vet | null>(null);

  useEffect(() => { if (!state.currentUserId) navigate({ to: "/auth" }); }, [state.currentUserId, navigate]);

  const list = useMemo(() => state.vets
    .filter((v) => country === "All" || v.country === country)
    .filter((v) => kind === "All" || v.kind === kind)
    .filter((v) => {
      const s = q.toLowerCase();
      return !s || v.name.toLowerCase().includes(s) || (v.specialty || "").toLowerCase().includes(s) || v.city.toLowerCase().includes(s);
    })
    .sort((a, b) => b.rating - a.rating), [state.vets, country, kind, q]);

  return (
    <AppShell title="Find a vet">
      <label className="flex items-center gap-2 h-11 rounded-2xl border border-border bg-card px-3 mb-3">
        <Search className="h-4 w-4 text-muted-foreground" />
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search hospitals, clinics, vets, specialists" className="flex-1 bg-transparent outline-none text-sm" />
      </label>

      <div className="flex gap-2 overflow-x-auto -mx-4 px-4 pb-2">
        {COUNTRIES.map((c) => (
          <Pill key={c} active={country === c} onClick={() => setCountry(c)}>{c}</Pill>
        ))}
      </div>
      <div className="flex gap-2 overflow-x-auto -mx-4 px-4 pb-1">
        {["All", "Hospital", "Clinic", "Veterinarian", "Specialist"].map((k) => (
          <Pill key={k} active={kind === k} onClick={() => setKind(k)}>{k}</Pill>
        ))}
      </div>

      <SectionTitle>{list.length} provider{list.length === 1 ? "" : "s"}</SectionTitle>
      <div className="space-y-2">
        {list.map((v) => (
          <button key={v.id} onClick={() => setActive(v)} className="w-full text-left rounded-2xl bg-card border border-border p-3 active:scale-[0.99] transition">
            <div className="flex items-start gap-3">
              <div className="h-11 w-11 rounded-2xl bg-primary/10 text-primary grid place-items-center">
                {v.kind === "Hospital" ? <Building2 className="h-5 w-5" /> : <Stethoscope className="h-5 w-5" />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 justify-between">
                  <div className="font-semibold text-[14px] truncate">{v.name}</div>
                  <span className="pill bg-warning/15 text-warning-foreground"><Star className="h-3 w-3 fill-current" />{v.rating}</span>
                </div>
                <div className="text-[11.5px] text-muted-foreground">{v.kind}{v.specialty ? " · " + v.specialty : ""} · {v.experienceYears} yrs</div>
                <div className="text-[11.5px] text-muted-foreground flex items-center gap-1 mt-1"><MapPin className="h-3 w-3" />{v.address}, {v.country}</div>
              </div>
            </div>
          </button>
        ))}
        {list.length === 0 && <div className="rounded-2xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">No providers match your filters.</div>}
      </div>

      {active && <VetSheet vet={active} onClose={() => setActive(null)} />}
    </AppShell>
  );
}

function Pill({ children, active, onClick }: { children: React.ReactNode; active?: boolean; onClick: () => void }) {
  return (
    <button onClick={onClick} className={`shrink-0 px-3 h-8 rounded-full text-[12px] font-semibold border transition-colors ${active ? "bg-primary text-primary-foreground border-primary" : "bg-card text-muted-foreground border-border hover:text-foreground"}`}>
      {children}
    </button>
  );
}

function VetSheet({ vet, onClose }: { vet: Vet; onClose: () => void }) {
  const { state, addReview, deleteReview } = useApp();
  const user = useCurrentUser();
  const reviews = state.reviews.filter((r) => r.vetId === vet.id);
  const [rating, setRating] = useState(5);
  const [text, setText] = useState("");

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-end sm:items-center justify-center px-4 pb-4" onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} className="w-full max-w-md glass-card rounded-3xl p-5 max-h-[90vh] overflow-y-auto">
        <div className="flex items-start justify-between mb-2">
          <div>
            <div className="text-[11px] font-semibold text-primary uppercase tracking-wider">{vet.kind}</div>
            <div className="text-lg font-extrabold leading-tight">{vet.name}</div>
            {vet.specialty && <div className="text-[12px] text-muted-foreground">{vet.specialty}</div>}
          </div>
          <button onClick={onClose} className="h-8 w-8 rounded-full hover:bg-muted grid place-items-center"><X className="h-4 w-4" /></button>
        </div>

        <div className="flex items-center gap-2 text-[12.5px] text-muted-foreground">
          <Star className="h-3.5 w-3.5 text-warning fill-current" /> {vet.rating} · {vet.reviewsCount} reviews · {vet.experienceYears} yrs experience
        </div>

        <div className="mt-3 grid grid-cols-2 gap-2">
          <a href={`tel:${vet.phone.replace(/\s/g, "")}`} className="rounded-2xl bg-primary text-primary-foreground h-11 inline-flex items-center justify-center gap-1.5 text-[13px] font-semibold">
            <Phone className="h-4 w-4" /> Call
          </a>
          <a target="_blank" rel="noreferrer" href={`https://www.google.com/maps/search/?api=1&query=${vet.lat},${vet.lng}`} className="rounded-2xl bg-card border border-border h-11 inline-flex items-center justify-center gap-1.5 text-[13px] font-semibold">
            <MapPin className="h-4 w-4" /> Directions
          </a>
        </div>

        <div className="mt-3 rounded-2xl border border-border bg-muted/40 p-3">
          <div className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">Address</div>
          <div className="text-[13px]">{vet.address}, {vet.city}, {vet.country}</div>
          <div className="text-[12px] text-muted-foreground mt-1">{vet.phone}</div>
        </div>

        <div className="mt-4">
          <div className="text-[13px] font-bold mb-2">Reviews</div>
          {user && (
            <div className="rounded-2xl border border-border bg-card p-3 mb-2">
              <div className="flex items-center gap-1 mb-2">
                {[1,2,3,4,5].map((n) => (
                  <button key={n} onClick={() => setRating(n)} aria-label={`${n} stars`}>
                    <Star className={`h-5 w-5 ${n <= rating ? "fill-warning text-warning" : "text-muted-foreground"}`} />
                  </button>
                ))}
              </div>
              <textarea value={text} onChange={(e) => setText(e.target.value)} placeholder="Share your experience" className="w-full rounded-xl border border-border bg-background p-2 text-sm outline-none focus:ring-2 focus:ring-primary/40 min-h-[60px]" />
              <button
                onClick={() => {
                  if (!text.trim()) return toast.error("Add a comment");
                  addReview({ vetId: vet.id, userId: user.id, userName: user.fullName, rating, text: text.trim() });
                  toast.success("Review posted");
                  setText("");
                }}
                className="mt-2 w-full h-10 rounded-xl bg-primary text-primary-foreground text-[13px] font-semibold"
              >Post review</button>
            </div>
          )}
          <div className="space-y-2">
            {reviews.map((r) => (
              <div key={r.id} className="rounded-2xl border border-border bg-card p-3">
                <div className="flex items-center justify-between">
                  <div className="text-[13px] font-semibold">{r.userName}</div>
                  <div className="flex items-center gap-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} className={`h-3.5 w-3.5 ${i < r.rating ? "fill-warning text-warning" : "text-muted-foreground"}`} />
                    ))}
                    {user?.id === r.userId && (
                      <button onClick={() => { deleteReview(r.id); toast.success("Removed"); }} className="ml-1 text-destructive">
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                </div>
                <p className="text-[12.5px] text-muted-foreground mt-1">{r.text}</p>
                <div className="text-[10.5px] text-muted-foreground mt-1">{new Date(r.date).toLocaleDateString()}</div>
              </div>
            ))}
            {reviews.length === 0 && <div className="text-[12.5px] text-muted-foreground">Be the first to leave a review.</div>}
          </div>
        </div>
      </div>
    </div>
  );
}
