import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";

export const Route = createFileRoute("/legal/privacy")({
  head: () => ({ meta: [{ title: "Privacy Policy — PetCareBuddy" }] }),
  component: PrivacyPage,
});

function PrivacyPage() {
  return <LegalShell title="Privacy Policy">
    <P>PetCareBuddy is committed to protecting the privacy of pet parents and their pets. This policy describes the information we collect, how we use it, and the rights you have as a user.</P>
    <H>1. Data we collect</H>
    <P>Account information you provide (name, email, mobile), pet profiles you create, medical records you upload, reviews you write, and limited device and usage telemetry needed to operate the app.</P>
    <H>2. How we use your data</H>
    <P>To deliver core features (records, reminders, AI health reviews), to keep your account secure, to improve the product, and to comply with applicable law.</P>
    <H>3. Data protection</H>
    <P>Medical records and personal information are stored using industry-standard encryption in transit and at rest. Access is scoped to the authenticated account holder.</P>
    <H>4. Your rights</H>
    <P>You may access, correct, export, or delete your data at any time from Settings. Account deletion permanently removes your pets, records, and reviews.</P>
    <H>5. Children & pets</H>
    <P>PetCareBuddy is intended for adult pet parents. We do not knowingly collect data from minors.</P>
    <H>6. Contact</H>
    <P>Questions? Reach our team from the Support tab.</P>
  </LegalShell>;
}

export function LegalShell({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="min-h-screen mx-auto max-w-2xl px-4 py-6">
      <div className="flex items-center gap-2 mb-4">
        <Link to="/settings" className="h-9 w-9 grid place-items-center rounded-full hover:bg-muted"><ArrowLeft className="h-4 w-4" /></Link>
        <h1 className="text-lg font-extrabold">{title}</h1>
      </div>
      <article className="prose prose-sm max-w-none text-foreground leading-relaxed">
        {children}
      </article>
      <p className="text-[11px] text-muted-foreground mt-8">Last updated: {new Date().toLocaleDateString()}</p>
    </div>
  );
}

export function H({ children }: { children: React.ReactNode }) {
  return <h2 className="text-[14px] font-bold mt-5 mb-1">{children}</h2>;
}
export function P({ children }: { children: React.ReactNode }) {
  return <p className="text-[13px] text-muted-foreground">{children}</p>;
}
