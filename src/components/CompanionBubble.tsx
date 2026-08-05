import { Sparkles, X, Activity, HeartPulse, AlertTriangle, ArrowRight } from "lucide-react";
import { useState } from "react";
import { useApp, useUserPets } from "@/lib/store";
import { Link } from "@tanstack/react-router";

export function CompanionBubble() {
  const [open, setOpen] = useState(false);
  const { state } = useApp();
  const pets = useUserPets();
  if (!state.currentUserId) return null;

  const insights = [
    `Monthly health review available for ${pets.length} pets.`,
    "2 follow-up recommendations available.",
    "1 important health insight available.",
  ];

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="fixed z-40 bottom-28 right-5 h-14 w-14 rounded-full gradient-teal text-white grid place-items-center shadow-pop animate-pulse-ring animate-float"
        aria-label="Open Companion"
      >
        <Sparkles className="h-6 w-6" />
        <span className="absolute -top-1 -right-1 bg-warning text-warning-foreground text-[10px] font-bold rounded-full px-1.5 py-0.5 shadow-soft">AI</span>
      </button>

      {open && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-end sm:items-center justify-center px-4 pb-4 animate-in fade-in" onClick={() => setOpen(false)}>
          <div
            className="w-full max-w-md glass-card rounded-3xl p-5 max-h-[85vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <div className="h-9 w-9 rounded-2xl gradient-teal grid place-items-center text-white">
                  <Sparkles className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-sm font-bold">PetCare Family Companion</div>
                  <div className="text-[11px] text-muted-foreground">AI-powered preventive insights</div>
                </div>
              </div>
              <button onClick={() => setOpen(false)} className="h-8 w-8 rounded-full hover:bg-muted grid place-items-center">
                <X className="h-4 w-4" />
              </button>
            </div>

            <ul className="mt-3 space-y-2">
              {insights.map((i, idx) => (
                <li key={idx} className="flex items-start gap-2 rounded-2xl bg-accent/60 px-3 py-2 text-[13px]">
                  <Activity className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                  <span>{i}</span>
                </li>
              ))}
            </ul>

            <div className="mt-4 text-[11px] font-semibold tracking-wide text-muted-foreground uppercase">Monthly Health Review</div>
            <div className="mt-2 space-y-3">
              {pets.map((p) => (
                <div key={p.id} className="rounded-2xl border border-border bg-card p-3">
                  <div className="flex items-center justify-between">
                    <div className="font-semibold text-sm">{p.name}</div>
                    <div className="flex gap-2 text-[11px]">
                      <span className="pill bg-primary/10 text-primary"><HeartPulse className="h-3 w-3" />Health {p.healthScore}</span>
                      <span className="pill bg-info/10 text-info"><Activity className="h-3 w-3" />Wellness {p.wellnessScore}</span>
                    </div>
                  </div>
                  <ul className="mt-2 text-[12.5px] text-muted-foreground space-y-1">
                    {summary(p.name).map((s, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="mt-1.5 h-1 w-1 rounded-full bg-primary shrink-0" />
                        {s}
                      </li>
                    ))}
                  </ul>
                  <Link to="/pets/$petId" params={{ petId: p.id }} onClick={() => setOpen(false)} className="mt-2 inline-flex items-center gap-1 text-[12px] font-semibold text-primary">
                    Open pet profile <ArrowRight className="h-3 w-3" />
                  </Link>
                </div>
              ))}
            </div>

            <div className="mt-4 rounded-2xl border border-warning/30 bg-warning/10 p-3 text-[12px] text-warning-foreground flex items-start gap-2">
              <AlertTriangle className="h-4 w-4 mt-0.5" />
              <div>
                <div className="font-semibold">Medical Disclaimer</div>
                PetCare Family provides educational information and preventive recommendations. It does not replace a licensed veterinarian.
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function summary(name: string): string[] {
  if (name === "Laddu") return ["Weight stable", "Vaccinations current", "Spot-On due in 30 days", "No major concerns"];
  if (name === "Motichoor") return ["Healthy and active", "Vaccinations current", "Normal blood markers"];
  if (name === "Neil") return ["Vaccination pending", "Follow-up wellness check recommended"];
  return ["No issues detected", "Continue monthly wellness routine"];
}
