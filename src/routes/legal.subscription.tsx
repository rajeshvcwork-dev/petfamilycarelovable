import { createFileRoute } from "@tanstack/react-router";
import { LegalShell, H, P } from "./legal.privacy";

export const Route = createFileRoute("/legal/subscription")({
  head: () => ({
    meta: [
      { title: "Subscription Policy — PetCare Family" },
      { name: "description", content: "Single and family plan terms, free trial, billing and renewals for PetCare Family." },
      { property: "og:title", content: "Subscription Policy — PetCare Family" },
      { property: "og:description", content: "Understand plan limits, free trial length, pricing and renewal terms." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: SubscriptionPage,
});

function SubscriptionPage() {
  return <LegalShell title="Subscription Policy">
    <P>PetCare Family offers two subscription plans, both billed through Razorpay.</P>
    <H>1. Single pet plan</H>
    <P>Maintains one pet profile with unlimited medical records, reminders and AI health reviews for that pet. Single-plan members can upgrade to the family plan at any time from Settings.</P>
    <H>2. Family plan</H>
    <P>Maintains up to four pet profiles under one account, with the same feature set for every pet. The family plan is the highest tier, so no further upgrade option is shown.</P>
    <H>3. Free trial</H>
    <P>New accounts receive a free trial for the number of days configured by PetCare Family. Full features are available during the trial. When the trial ends, a paid plan is required to continue adding pets and records.</P>
    <H>4. Pricing & period</H>
    <P>Plan amount, currency and subscription period are shown at checkout before payment. Prices may change for future periods; any change is communicated before it applies to you.</P>
    <H>5. Renewal & expiry</H>
    <P>Access remains active until the expiry date of the paid period. We may extend a subscription period in genuine service-disruption cases.</P>
    <H>6. Downgrades</H>
    <P>If a family plan is not renewed, pet profiles beyond the single-plan limit become read-only until you renew or remove them. Your data is never deleted without your action.</P>
  </LegalShell>;
}
