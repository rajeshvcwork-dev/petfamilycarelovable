import { createFileRoute } from "@tanstack/react-router";
import { LegalShell, H, P } from "./legal.privacy";

export const Route = createFileRoute("/legal/refund")({
  head: () => ({
    meta: [
      { title: "Refund Policy — PetCare Family" },
      { name: "description", content: "How refunds are handled for PetCare Family single and family pet care subscriptions." },
      { property: "og:title", content: "Refund Policy — PetCare Family" },
      { property: "og:description", content: "Refund eligibility, timelines and how to request a refund for your PetCare Family plan." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: RefundPage,
});

function RefundPage() {
  return <LegalShell title="Refund Policy">
    <P>This policy explains when a PetCare Family subscription payment can be refunded and how to request one.</P>
    <H>1. Free trial first</H>
    <P>Every new pet parent can use the app on a free trial before paying. We recommend evaluating the app fully during the trial, because payments made after the trial are for access already granted.</P>
    <H>2. Refund window</H>
    <P>You may request a full refund within 7 days of a subscription charge, provided the plan has not been used to store more than the free-trial number of pet profiles or records during that period.</P>
    <H>3. Non-refundable cases</H>
    <P>Renewals after the 7-day window, partially used subscription periods, and plans cancelled mid-cycle are not refundable. Payment-gateway fees on successful transactions are also non-refundable.</P>
    <H>4. Failed or duplicate payments</H>
    <P>Duplicate charges and payments that were captured without activating a subscription are refunded in full, automatically, once verified against our payment records.</P>
    <H>5. How to request</H>
    <P>Raise the request from the Support tab with your registered email and mobile number. Approved refunds are returned to the original payment method within 5–7 business days by Razorpay.</P>
  </LegalShell>;
}
