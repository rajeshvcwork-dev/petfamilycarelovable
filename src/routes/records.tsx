import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { AppShell, SectionTitle } from "@/components/AppShell";
import { useApp, useUserPets } from "@/lib/store";
import { Download, FileText, Search, Share2, Trash2, Upload, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import type { MedicalRecord } from "@/lib/seed";

export const Route = createFileRoute("/records")({
  head: () => ({ meta: [{ title: "Medical records — PetCareBuddy" }] }),
  component: RecordsPage,
});

const TYPES: MedicalRecord["type"][] = ["CBC", "Blood", "Urine", "Stool", "Prescription", "Consultation", "Vaccination", "Other"];

function RecordsPage() {
  const { state, addRecord, deleteRecord } = useApp();
  const pets = useUserPets();
  const navigate = useNavigate();
  const [q, setQ] = useState("");
  const [type, setType] = useState<string>("all");
  const [petFilter, setPetFilter] = useState<string>("all");
  const [adding, setAdding] = useState(false);

  useEffect(() => { if (!state.currentUserId) navigate({ to: "/auth" }); }, [state.currentUserId, navigate]);

  const all = useMemo(() => state.records
    .filter((r) => pets.some((p) => p.id === r.petId))
    .filter((r) => type === "all" || r.type === type)
    .filter((r) => petFilter === "all" || r.petId === petFilter)
    .filter((r) => {
      const s = q.toLowerCase();
      return !s || r.title.toLowerCase().includes(s) || (r.vet || "").toLowerCase().includes(s) || (r.summary || "").toLowerCase().includes(s);
    })
    .sort((a, b) => +new Date(b.date) - +new Date(a.date)), [state.records, pets, type, petFilter, q]);

  return (
    <AppShell title="Medical records">
      <div className="flex gap-2 mb-3">
        <label className="flex-1 flex items-center gap-2 h-11 rounded-2xl border border-border bg-card px-3">
          <Search className="h-4 w-4 text-muted-foreground" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search records, vets, diagnoses…" className="flex-1 bg-transparent outline-none text-sm" />
        </label>
        <button onClick={() => setAdding(true)} className="h-11 px-4 rounded-2xl gradient-teal text-white text-sm font-semibold inline-flex items-center gap-1.5">
          <Upload className="h-4 w-4" /> Add
        </button>
      </div>

      <div className="flex gap-2 overflow-x-auto -mx-4 px-4 pb-2">
        <Chip active={petFilter === "all"} onClick={() => setPetFilter("all")}>All pets</Chip>
        {pets.map((p) => (
          <Chip key={p.id} active={petFilter === p.id} onClick={() => setPetFilter(p.id)}>{p.name}</Chip>
        ))}
      </div>
      <div className="flex gap-2 overflow-x-auto -mx-4 px-4 pb-1">
        <Chip active={type === "all"} onClick={() => setType("all")}>All types</Chip>
        {TYPES.map((t) => (
          <Chip key={t} active={type === t} onClick={() => setType(t)}>{t}</Chip>
        ))}
      </div>

      <SectionTitle>{all.length} record{all.length === 1 ? "" : "s"}</SectionTitle>

      <div className="space-y-2">
        {all.map((r) => {
          const pet = pets.find((p) => p.id === r.petId);
          return (
            <div key={r.id} className="rounded-2xl bg-card border border-border p-3">
              <div className="flex items-start gap-3">
                <div className="h-10 w-10 rounded-xl bg-info/10 text-info grid place-items-center"><FileText className="h-5 w-5" /></div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 justify-between">
                    <div className="text-[13.5px] font-semibold truncate">{r.title}</div>
                    <span className="pill bg-muted text-muted-foreground">{r.type}</span>
                  </div>
                  <div className="text-[11.5px] text-muted-foreground">{pet?.name} · {r.vet || "—"} · {new Date(r.date).toLocaleDateString()}</div>
                  {r.summary && <p className="text-[12.5px] text-foreground mt-1.5">{r.summary}</p>}
                  <div className="flex items-center gap-1 mt-2">
                    <Action label="Download" icon={Download} onClick={() => toast.success("Downloaded (demo)")} />
                    <Action label="Share" icon={Share2} onClick={() => toast.success("Share link copied")} />
                    <Action label="Delete" icon={Trash2} danger onClick={() => { if (confirm("Delete record?")) { deleteRecord(r.id); toast.success("Deleted"); } }} />
                  </div>
                </div>
              </div>
            </div>
          );
        })}
        {all.length === 0 && (
          <div className="rounded-2xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
            No records match. Try adjusting filters or add a new one.
          </div>
        )}
      </div>

      {adding && <AddRecord onClose={() => setAdding(false)} onSave={(r) => { addRecord(r); toast.success("Record added"); setAdding(false); }} />}
    </AppShell>
  );
}

function Chip({ children, active, onClick }: { children: React.ReactNode; active?: boolean; onClick: () => void }) {
  return (
    <button onClick={onClick} className={`shrink-0 px-3 h-8 rounded-full text-[12px] font-semibold border transition-colors ${active ? "bg-primary text-primary-foreground border-primary" : "bg-card text-muted-foreground border-border hover:text-foreground"}`}>
      {children}
    </button>
  );
}

function Action({ label, icon: Icon, onClick, danger }: { label: string; icon: React.ComponentType<{ className?: string }>; onClick: () => void; danger?: boolean }) {
  return (
    <button onClick={onClick} className={`inline-flex items-center gap-1 px-2.5 h-7 rounded-full text-[11.5px] font-semibold ${danger ? "text-destructive hover:bg-destructive/10" : "text-muted-foreground hover:bg-muted"}`}>
      <Icon className="h-3.5 w-3.5" /> {label}
    </button>
  );
}

function AddRecord({ onClose, onSave }: { onClose: () => void; onSave: (r: Omit<MedicalRecord, "id">) => void }) {
  const pets = useUserPets();
  const [title, setTitle] = useState("");
  const [petId, setPetId] = useState(pets[0]?.id || "");
  const [type, setType] = useState<MedicalRecord["type"]>("CBC");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [vet, setVet] = useState("");
  const [summary, setSummary] = useState("");
  const [file, setFile] = useState<File | null>(null);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !petId) return toast.error("Title and pet are required");
    onSave({ title, petId, type, date: new Date(date).toISOString(), vet, summary, fileName: file?.name });
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-end sm:items-center justify-center px-4 pb-4" onClick={onClose}>
      <form onClick={(e) => e.stopPropagation()} onSubmit={submit} className="w-full max-w-md glass-card rounded-3xl p-5 max-h-[90vh] overflow-y-auto space-y-2">
        <div className="flex items-center justify-between mb-2">
          <div className="font-bold">Add medical record</div>
          <button type="button" onClick={onClose} className="h-8 w-8 rounded-full hover:bg-muted grid place-items-center"><X className="h-4 w-4" /></button>
        </div>
        <Labeled label="Title"><input className="inp" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="CBC Report — July" /></Labeled>
        <div className="grid grid-cols-2 gap-2">
          <Labeled label="Pet">
            <select className="inp" value={petId} onChange={(e) => setPetId(e.target.value)}>
              {pets.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </Labeled>
          <Labeled label="Type">
            <select className="inp" value={type} onChange={(e) => setType(e.target.value as MedicalRecord["type"])}>
              {TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </Labeled>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <Labeled label="Date"><input type="date" className="inp" value={date} onChange={(e) => setDate(e.target.value)} /></Labeled>
          <Labeled label="Vet"><input className="inp" value={vet} onChange={(e) => setVet(e.target.value)} placeholder="Dr. Anita Rao" /></Labeled>
        </div>
        <Labeled label="Summary"><textarea className="inp min-h-[80px] py-2" value={summary} onChange={(e) => setSummary(e.target.value)} placeholder="Key findings…" /></Labeled>
        <Labeled label="File (PDF / JPG / PNG)">
          <input type="file" accept=".pdf,image/*" onChange={(e) => setFile(e.target.files?.[0] || null)} className="text-xs" />
        </Labeled>
        <button type="submit" className="mt-2 w-full h-11 rounded-2xl gradient-teal text-white font-semibold">Save record</button>
        <style>{`.inp{width:100%;height:44px;border-radius:1rem;border:1px solid var(--border);background:var(--card);padding:0 12px;font-size:14px;outline:none}.inp:focus{box-shadow:0 0 0 2px color-mix(in oklab, var(--primary) 40%, transparent)}`}</style>
      </form>
    </div>
  );
}

function Labeled({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <div className="text-[11px] font-semibold text-muted-foreground mb-1">{label}</div>
      {children}
    </label>
  );
}
