import { createFileRoute, Link, useNavigate, useParams } from "@tanstack/react-router";
import { AppShell, SectionTitle } from "@/components/AppShell";
import { useApp } from "@/lib/store";
import { ArrowLeft, FileText, HeartPulse, Pencil, ShieldCheck, Sparkles, Trash2, Upload } from "lucide-react";
import { ScoreRing } from "@/components/ScoreRing";
import { useState } from "react";
import { toast } from "sonner";
import { PetForm } from "./pets";

export const Route = createFileRoute("/pets/$petId")({
  head: () => ({ meta: [{ title: "Pet profile — PetCare Family" }] }),
  component: PetDetail,
});

function PetDetail() {
  const { petId } = useParams({ from: "/pets/$petId" });
  const { state, updatePet, deletePet, addRecord, deleteRecord } = useApp();
  const pet = state.pets.find((p) => p.id === petId);
  const navigate = useNavigate();
  const [editing, setEditing] = useState(false);

  if (!pet) {
    return (
      <AppShell>
        <div className="text-center py-16">
          <div className="text-sm text-muted-foreground">Pet not found.</div>
          <Link to="/pets" className="text-primary text-sm font-semibold mt-2 inline-block">Back to pets</Link>
        </div>
      </AppShell>
    );
  }

  const records = state.records.filter((r) => r.petId === pet.id);

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    addRecord({
      petId: pet.id,
      title: f.name.replace(/\.[^.]+$/, ""),
      type: "Other",
      date: new Date().toISOString(),
      fileName: f.name,
      summary: `Uploaded ${(f.size / 1024).toFixed(0)} KB · ${f.type || "file"}`,
    });
    toast.success("Record uploaded");
    e.target.value = "";
  };

  return (
    <AppShell title={pet.name}>
      <div className="flex items-center gap-2 mb-2">
        <Link to="/pets" className="h-9 w-9 grid place-items-center rounded-full hover:bg-muted">
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div className="flex-1" />
        <button onClick={() => setEditing(true)} className="h-9 px-3 rounded-full bg-card border border-border text-[12px] font-semibold inline-flex items-center gap-1.5">
          <Pencil className="h-3.5 w-3.5" /> Edit
        </button>
        <button onClick={() => { if (confirm(`Delete ${pet.name}?`)) { deletePet(pet.id); toast.success("Pet removed"); navigate({ to: "/pets" }); } }} className="h-9 w-9 grid place-items-center rounded-full bg-destructive/10 text-destructive">
          <Trash2 className="h-4 w-4" />
        </button>
      </div>

      <div className="rounded-3xl gradient-teal text-white p-5 shadow-card relative overflow-hidden">
        <div className="absolute -right-6 -top-6 h-32 w-32 rounded-full bg-white/15 blur-2xl" />
        <div className="relative flex items-center gap-4">
          <div className="h-16 w-16 rounded-2xl bg-white/20 grid place-items-center text-3xl">
            {pet.species === "Cat" ? "🐱" : pet.species === "Dog" ? "🐶" : "🐾"}
          </div>
          <div className="flex-1">
            <div className="text-xl font-extrabold">{pet.name}</div>
            <div className="text-[12.5px] opacity-90">{pet.breed} · {pet.gender} · {pet.ageYears} years · {pet.weightKg} kg</div>
            <div className="mt-1 flex gap-1.5">
              {pet.vaccinated ? (
                <span className="pill bg-white/20"><ShieldCheck className="h-3 w-3" />Vaccinated</span>
              ) : (
                <span className="pill bg-warning/40">Vaccination pending</span>
              )}
              <span className="pill bg-white/20">Spot-On in {pet.spotOnDueDays}d</span>
            </div>
          </div>
        </div>

        <div className="relative grid grid-cols-2 gap-3 mt-4">
          <div className="rounded-2xl bg-white/15 backdrop-blur p-3 flex items-center gap-3">
            <ScoreRing value={pet.healthScore} size={56} tone="success" />
            <div>
              <div className="text-[11px] opacity-90">Health</div>
              <div className="font-bold text-sm">Medical · Labs · Vax</div>
            </div>
          </div>
          <div className="rounded-2xl bg-white/15 backdrop-blur p-3 flex items-center gap-3">
            <ScoreRing value={pet.wellnessScore} size={56} tone="info" />
            <div>
              <div className="text-[11px] opacity-90">Wellness</div>
              <div className="font-bold text-sm">Preventive · Follow-up</div>
            </div>
          </div>
        </div>
      </div>

      {/* AI Insights */}
      <div className="mt-4 rounded-3xl border border-primary/20 bg-primary/5 p-4">
        <div className="flex items-center gap-2 mb-2">
          <Sparkles className="h-4 w-4 text-primary" />
          <div className="text-[13px] font-bold">AI Pet Health Review</div>
        </div>
        <ul className="text-[12.5px] space-y-1 text-foreground">
          {(pet.conditions || ["No active conditions detected."]).map((c, i) => (
            <li key={i} className="flex items-start gap-2"><span className="h-1 w-1 rounded-full bg-primary mt-2" />{c}</li>
          ))}
          {pet.notes && <li className="flex items-start gap-2"><span className="h-1 w-1 rounded-full bg-primary mt-2" />{pet.notes}</li>}
        </ul>
      </div>

      <SectionTitle icon={FileText} action={
        <label className="text-[12px] font-semibold text-primary inline-flex items-center gap-1 cursor-pointer">
          <Upload className="h-3.5 w-3.5" /> Upload
          <input type="file" hidden onChange={handleUpload} accept=".pdf,image/*" />
        </label>
      }>
        Medical records ({records.length})
      </SectionTitle>

      <div className="space-y-2">
        {records.map((r) => (
          <div key={r.id} className="rounded-2xl bg-card border border-border p-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-xl bg-info/10 text-info grid place-items-center"><FileText className="h-4 w-4" /></div>
                <div>
                  <div className="text-[13px] font-semibold">{r.title}</div>
                  <div className="text-[11px] text-muted-foreground">{r.vet ? r.vet + " · " : ""}{new Date(r.date).toLocaleDateString()}</div>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <span className="pill bg-muted text-muted-foreground">{r.type}</span>
                <button onClick={() => { if (confirm("Delete this record?")) { deleteRecord(r.id); toast.success("Deleted"); } }} className="h-8 w-8 grid place-items-center rounded-full hover:bg-destructive/10 text-destructive">
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
            {r.summary && <p className="text-[12px] text-muted-foreground mt-2">{r.summary}</p>}
          </div>
        ))}
        {records.length === 0 && (
          <div className="rounded-2xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
            No records yet. Use Upload to add one.
          </div>
        )}
      </div>

      <SectionTitle icon={HeartPulse}>Timeline</SectionTitle>
      <div className="rounded-2xl border border-border bg-card p-4">
        <ol className="space-y-3">
          {records.slice().sort((a, b) => +new Date(b.date) - +new Date(a.date)).map((r) => (
            <li key={r.id} className="flex gap-3">
              <div className="flex flex-col items-center">
                <span className="h-2 w-2 rounded-full bg-primary mt-1.5" />
                <span className="flex-1 w-px bg-border mt-1" />
              </div>
              <div>
                <div className="text-[12px] text-muted-foreground">{new Date(r.date).toLocaleDateString()}</div>
                <div className="text-[13px] font-semibold">{r.title}</div>
                {r.summary && <div className="text-[12px] text-muted-foreground">{r.summary}</div>}
              </div>
            </li>
          ))}
          {records.length === 0 && <li className="text-sm text-muted-foreground">No timeline events yet.</li>}
        </ol>
      </div>

      {editing && (
        <PetForm
          initial={pet}
          onClose={() => setEditing(false)}
          onSave={(data) => { updatePet(pet.id, data); toast.success("Pet updated"); setEditing(false); }}
        />
      )}
    </AppShell>
  );
}
