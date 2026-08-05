import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { AppShell, SectionTitle } from "@/components/AppShell";
import { useApp, useCurrentUser } from "@/lib/store";
import { Building2, ExternalLink, Globe, Loader2, MapPin, Phone, Search, Star, Stethoscope, Trash2, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import type { Vet } from "@/lib/seed";
import { useServerFn } from "@tanstack/react-start";
import { searchProviders, type ProviderResult } from "@/lib/places.functions";

export const Route = createFileRoute("/vets")({
  head: () => ({
    meta: [
      { title: "Find a vet near you — PetCare Family" },
      { name: "description", content: "Search live for veterinary hospitals, clinics and specialists near you and view results right inside PetCare Family." },
      { property: "og:title", content: "Find a vet near you — PetCare Family" },
      { property: "og:description", content: "Search live for veterinary hospitals, clinics and specialists near you." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: VetsPage,
});

const QUICK = ["Veterinary hospital", "Vet clinic", "Emergency vet", "Cat specialist vet"];

function VetsPage() {
  const { state } = useApp();
  const navigate = useNavigate();
  const user = useCurrentUser();
  const runSearch = useServerFn(searchProviders);

  const [q, setQ] = useState("");
  const [near, setNear] = useState(user?.location ?? "");
  const [kind, setKind] = useState<string>("All");
  const [active, setActive] = useState<Vet | null>(null);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [results, setResults] = useState<ProviderResult[]>([]);

  useEffect(() => { if (!state.currentUserId) navigate({ to: "/auth" }); }, [state.currentUserId, navigate]);

  const saved = useMemo(
    () => state.vets.filter((v) => kind === "All" || v.kind === kind).sort((a, b) => b.rating - a.rating),
    [state.vets, kind],
  );

  const googleQuery = [q.trim(), near.trim()].filter(Boolean).join(" ");

  async function submit(term?: string) {
    const query = (term ?? q).trim();
    if (query.length < 2) return toast.error("Type what you're looking for");
    setQ(query);
    setLoading(true);
    try {
      const res = await runSearch({ data: { query, near: near.trim() || undefined } });
      setResults(res.results);
      setSearched(true);
      if (res.error) toast.error(res.error);
      else if (res.results.length === 0) toast.info("No providers found — try a different area");
    } catch {
      toast.error("Search failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AppShell title="Find a vet">
      <form
        onSubmit={(e) => { e.preventDefault(); void submit(); }}
        className="space-y-2 mb-3"
      >
        <label className="flex items-center gap-2 h-11 rounded-2xl border border-border bg-card px-3">
          <Search className="h-4 w-4 text-muted-foreground" />
          <input value={q} onChange={(e) => setQ(e.target.value)} maxLength={120} placeholder="Veterinary hospital, doctor, clinic…" className="flex-1 bg-transparent outline-none text-sm" />
        </label>
        <div className="flex gap-2">
          <label className="flex-1 flex items-center gap-2 h-11 rounded-2xl border border-border bg-card px-3">
            <MapPin className="h-4 w-4 text-muted-foreground" />
            <input value={near} onChange={(e) => setNear(e.target.value)} maxLength={120} placeholder="Area or city" className="flex-1 bg-transparent outline-none text-sm" />
          </label>
          <button type="submit" disabled={loading} className="px-5 h-11 rounded-2xl gradient-teal text-white text-[13px] font-semibold inline-flex items-center gap-2 disabled:opacity-60">
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />} Search
          </button>
        </div>
        {googleQuery.length > 1 && (
          <a
            target="_blank"
            rel="noreferrer"
            href={`https://www.google.com/search?q=${encodeURIComponent(googleQuery)}`}
            className="w-full h-10 rounded-2xl border border-border bg-card text-[12.5px] font-semibold inline-flex items-center justify-center gap-2"
          >
            <Globe className="h-3.5 w-3.5" /> Search “{googleQuery}” on Google
          </a>
        )}
      </form>

      <div className="flex gap-2 overflow-x-auto -mx-4 px-4 pb-2">
        {QUICK.map((t) => (
          <Pill key={t} active={q === t} onClick={() => void submit(t)}>{t}</Pill>
        ))}
      </div>

      {searched && (
        <>
          <SectionTitle icon={Globe}>{results.length} result{results.length === 1 ? "" : "s"}</SectionTitle>
          <div className="space-y-2">
            {results.map((r) => (
              <div key={r.id} className="rounded-2xl bg-card border border-border p-3">
                <div className="flex items-start gap-3">
                  <div className="h-11 w-11 rounded-2xl bg-primary/10 text-primary grid place-items-center"><Stethoscope className="h-5 w-5" /></div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 justify-between">
                      <div className="font-semibold text-[14px] truncate">{r.name}</div>
                      <span className="pill bg-muted text-muted-foreground shrink-0 capitalize">{r.category}</span>
                    </div>
                    <div className="text-[11.5px] text-muted-foreground flex items-start gap-1 mt-1"><MapPin className="h-3 w-3 mt-0.5 shrink-0" />{r.address}</div>
                    <div className="flex flex-wrap gap-2 mt-2">
                      <a target="_blank" rel="noreferrer" href={r.searchUrl} className="pill bg-primary/10 text-primary"><Globe className="h-3 w-3" />Google details</a>
                      <a target="_blank" rel="noreferrer" href={r.mapsUrl} className="pill bg-muted text-muted-foreground"><MapPin className="h-3 w-3" />Directions</a>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            {results.length === 0 && (
              <div className="rounded-2xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">No providers found for that search.</div>
            )}
          </div>
        </>
      )}



      <div className="flex gap-2 overflow-x-auto -mx-4 px-4 pb-1 mt-4">
        {["All", "Hospital", "Clinic", "Veterinarian", "Specialist"].map((k) => (
          <Pill key={k} active={kind === k} onClick={() => setKind(k)}>{k}</Pill>
        ))}
      </div>
      <SectionTitle>Your saved providers</SectionTitle>
      <div className="space-y-2">
        {saved.map((v) => (
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
                <div className="text-[11.5px] text-muted-foreground flex items-center gap-1 mt-1"><MapPin className="h-3 w-3" />{v.address}</div>
              </div>
            </div>
          </button>
        ))}
        {saved.length === 0 && <div className="rounded-2xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">No saved providers yet.</div>}
      </div>

      {active && <VetSheet vet={active} onClose={() => setActive(null)} />}
    </AppShell>
  );
}

function Pill({ children, active, onClick }: { children: React.ReactNode; active?: boolean; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} className={`shrink-0 px-3 h-8 rounded-full text-[12px] font-semibold border transition-colors ${active ? "bg-primary text-primary-foreground border-primary" : "bg-card text-muted-foreground border-border hover:text-foreground"}`}>
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
          <div className="text-[13px]">{vet.address}, {vet.city}</div>
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
              <textarea value={text} onChange={(e) => setText(e.target.value)} maxLength={1000} placeholder="Share your experience" className="w-full rounded-xl border border-border bg-background p-2 text-sm outline-none focus:ring-2 focus:ring-primary/40 min-h-[60px]" />
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
