import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { AppShell, SectionTitle } from "@/components/AppShell";
import { useApp, useUserPets } from "@/lib/store";
import { Plus, Search, ShieldCheck, Trash2, Pencil, X } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import type { Pet } from "@/lib/seed";

export const Route = createFileRoute("/pets")({
  head: () => ({ meta: [{ title: "My Pets — PetCare Family" }] }),
  component: PetsPage,
});

function PetsPage() {
  const pets = useUserPets();
  const { addPet, deletePet, state } = useApp();
  const navigate = useNavigate();
  const [q, setQ] = useState("");
  const [adding, setAdding] = useState(false);

  useEffect(() => { if (!state.currentUserId) navigate({ to: "/auth" }); }, [state.currentUserId, navigate]);

  const filtered = pets.filter((p) => p.name.toLowerCase().includes(q.toLowerCase()) || p.breed.toLowerCase().includes(q.toLowerCase()));

  return (
    <AppShell title="My Pets">
      <div className="flex gap-2 mb-3">
        <label className="flex-1 flex items-center gap-2 h-11 rounded-2xl border border-border bg-card px-3">
          <Search className="h-4 w-4 text-muted-foreground" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search pets" className="flex-1 bg-transparent outline-none text-sm" />
        </label>
        <button onClick={() => setAdding(true)} className="h-11 px-4 rounded-2xl gradient-teal text-white text-sm font-semibold shadow-soft inline-flex items-center gap-1">
          <Plus className="h-4 w-4" /> Add
        </button>
      </div>

      <SectionTitle>All pets ({filtered.length})</SectionTitle>
      <div className="space-y-2">
        {filtered.map((p) => (
          <div key={p.id} className="rounded-2xl bg-card border border-border p-3 flex items-center gap-3">
            <Link to="/pets/$petId" params={{ petId: p.id }} className="flex items-center gap-3 flex-1 min-w-0">
              <div className="h-12 w-12 rounded-2xl bg-accent grid place-items-center text-xl">
                {p.species === "Cat" ? "🐱" : p.species === "Dog" ? "🐶" : "🐾"}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-sm flex items-center gap-1.5">
                  {p.name}
                  {p.vaccinated && <ShieldCheck className="h-3.5 w-3.5 text-success" />}
                </div>
                <div className="text-[11.5px] text-muted-foreground truncate">{p.breed} · {p.gender} · {p.ageYears}y · {p.weightKg}kg</div>
              </div>
            </Link>
            <Link to="/pets/$petId" params={{ petId: p.id }} className="h-9 w-9 grid place-items-center rounded-full hover:bg-muted text-muted-foreground">
              <Pencil className="h-4 w-4" />
            </Link>
            <button onClick={() => { if (confirm(`Delete ${p.name}?`)) { deletePet(p.id); toast.success(`${p.name} removed`); } }} className="h-9 w-9 grid place-items-center rounded-full hover:bg-destructive/10 text-destructive">
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="rounded-2xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
            No pets match your search.
          </div>
        )}
      </div>

      {adding && <PetForm onClose={() => setAdding(false)} onSave={(data) => { const id = addPet(data); toast.success("Pet added"); setAdding(false); navigate({ to: "/pets/$petId", params: { petId: id } }); }} />}
    </AppShell>
  );
}

export function PetForm({ initial, onClose, onSave }: { initial?: Pet; onClose: () => void; onSave: (p: Omit<Pet, "id">) => void }) {
  const [name, setName] = useState(initial?.name || "");
  const [species, setSpecies] = useState<Pet["species"]>(initial?.species || "Cat");
  const [breed, setBreed] = useState(initial?.breed || "");
  const [gender, setGender] = useState<Pet["gender"]>(initial?.gender || "Female");
  const [ageYears, setAge] = useState(initial?.ageYears ?? 1);
  const [weightKg, setWeight] = useState(initial?.weightKg ?? 4);
  const [vaccinated, setVaccinated] = useState(initial?.vaccinated ?? false);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !breed) return toast.error("Name and breed are required");
    onSave({
      ownerId: initial?.ownerId || "",
      name, species, breed, gender, ageYears: Number(ageYears), weightKg: Number(weightKg),
      vaccinated, spotOnDueDays: initial?.spotOnDueDays ?? 30,
      healthScore: initial?.healthScore ?? 85, wellnessScore: initial?.wellnessScore ?? 85,
      conditions: initial?.conditions, notes: initial?.notes, photo: initial?.photo,
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-end sm:items-center justify-center px-4 pb-4" onClick={onClose}>
      <form onClick={(e) => e.stopPropagation()} onSubmit={submit} className="w-full max-w-md glass-card rounded-3xl p-5 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-3">
          <div className="font-bold">{initial ? "Edit pet" : "Add new pet"}</div>
          <button type="button" onClick={onClose} className="h-8 w-8 rounded-full hover:bg-muted grid place-items-center"><X className="h-4 w-4" /></button>
        </div>
        <div className="space-y-2">
          <Input label="Name" value={name} onChange={setName} />
          <div className="grid grid-cols-2 gap-2">
            <Select label="Species" value={species} onChange={(v) => setSpecies(v as Pet["species"])} options={["Cat", "Dog", "Bird", "Rabbit", "Other"]} />
            <Select label="Gender" value={gender} onChange={(v) => setGender(v as Pet["gender"])} options={["Female", "Male"]} />
          </div>
          <Input label="Breed" value={breed} onChange={setBreed} />
          <div className="grid grid-cols-2 gap-2">
            <Input label="Age (years)" value={String(ageYears)} onChange={(v) => setAge(Number(v) || 0)} type="number" />
            <Input label="Weight (kg)" value={String(weightKg)} onChange={(v) => setWeight(Number(v) || 0)} type="number" />
          </div>
          <label className="flex items-center gap-2 text-sm py-2">
            <input type="checkbox" checked={vaccinated} onChange={(e) => setVaccinated(e.target.checked)} className="h-4 w-4 accent-[oklch(0.62_0.12_195)]" />
            Vaccinated
          </label>
        </div>
        <button type="submit" className="mt-2 w-full h-11 rounded-2xl gradient-teal text-white font-semibold">Save</button>
      </form>
    </div>
  );
}

function Input({ label, value, onChange, type = "text" }: { label: string; value: string; onChange: (v: string) => void; type?: string }) {
  return (
    <label className="block">
      <div className="text-[11px] font-semibold text-muted-foreground mb-1">{label}</div>
      <input value={value} onChange={(e) => onChange(e.target.value)} type={type} className="w-full h-11 rounded-2xl border border-border bg-card px-3 text-sm outline-none focus:ring-2 focus:ring-primary/40" />
    </label>
  );
}

function Select({ label, value, onChange, options }: { label: string; value: string; onChange: (v: string) => void; options: string[] }) {
  return (
    <label className="block">
      <div className="text-[11px] font-semibold text-muted-foreground mb-1">{label}</div>
      <select value={value} onChange={(e) => onChange(e.target.value)} className="w-full h-11 rounded-2xl border border-border bg-card px-3 text-sm outline-none focus:ring-2 focus:ring-primary/40">
        {options.map((o) => <option key={o} value={o}>{o}</option>)}
      </select>
    </label>
  );
}
