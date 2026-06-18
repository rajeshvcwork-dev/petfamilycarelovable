import { createFileRoute } from "@tanstack/react-router";
import { H, LegalShell, P } from "./legal.privacy";

export const Route = createFileRoute("/legal/data")({
  head: () => ({ meta: [{ title: "Data Policy — PetCareBuddy" }] }),
  component: DataPage,
});

function DataPage() {
  return (
    <LegalShell title="Data & Storage Policy">
      <P>This document explains what data PetCareBuddy collects, why we collect it, and how it is stored.</P>
      <H>What is collected</H>
      <P>Account details, pet profiles, medical records you choose to upload, reminders, reviews, and limited device/usage telemetry needed to operate the app.</P>
      <H>Why it is collected</H>
      <P>To provide the core PetCareBuddy experience (records, reminders, AI-powered health reviews), to keep the service secure and reliable, and to offer customer support.</P>
      <H>How it is used</H>
      <P>Data is processed to render dashboards, generate insights, and trigger reminders. We do not sell your data.</P>
      <H>Local storage</H>
      <P>Some preferences and offline data are stored on your device using encrypted local storage.</P>
      <H>Cloud storage</H>
      <P>When enabled, medical records and account data are stored in secure cloud infrastructure with encryption in transit and at rest.</P>
      <H>Data ownership</H>
      <P>You own your data. You may export or delete it at any time from Settings.</P>
    </LegalShell>
  );
}
