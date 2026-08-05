import { createFileRoute } from "@tanstack/react-router";
import { LegalShell, H, P } from "./legal.privacy";

export const Route = createFileRoute("/legal/cancellation")({
  head: () => ({
    meta: [
      { title: "Cancellation Policy — PetCare Family" },
      { name: "description", content: "How to cancel a PetCare Family subscription and what happens to your pet data afterwards." },
      { property: "og:title", content: "Cancellation Policy — PetCare Family" },
      { property: "og:description", content: "Cancel any time from Settings; access continues until the paid period ends." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: CancellationPage,
});

function CancellationPage() {
  return <LegalShell title="Cancellation Policy">
    <P>You are always in control of your PetCare Family subscription.</P>
    <H>1. Cancel any time</H>
    <P>Request cancellation from the Support tab or by writing to us with your registered email and mobile number. No cancellation fee applies.</P>
    <H>2. Access after cancellation</H>
    <P>Your plan stays active until the end of the period you already paid for. After that, the account moves to a limited free state.</P>
    <H>3. Your data</H>
    <P>Pet profiles, medical records and reminders remain in your account after cancellation so you can return without losing history. You can permanently delete everything from Settings.</P>
    <H>4. Trial cancellation</H>
    <P>Cancelling during the free trial ends the trial immediately and no payment is taken.</P>
    <H>5. Refunds</H>
    <P>Cancellation and refund are separate: see the Refund Policy for refund eligibility.</P>
  </LegalShell>;
}
