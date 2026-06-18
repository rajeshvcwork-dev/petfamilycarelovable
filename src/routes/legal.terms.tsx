import { createFileRoute } from "@tanstack/react-router";
import { H, LegalShell, P } from "./legal.privacy";

export const Route = createFileRoute("/legal/terms")({
  head: () => ({ meta: [{ title: "Terms & Conditions — PetCareBuddy" }] }),
  component: TermsPage,
});

function TermsPage() {
  return (
    <LegalShell title="Terms & Conditions">
      <P>By creating an account or using PetCareBuddy, you agree to these terms.</P>
      <H>Account usage</H>
      <P>You are responsible for the security of your account credentials and for activity on your account.</P>
      <H>User responsibilities</H>
      <P>You agree to provide accurate pet and contact information, and to use the app only for lawful, personal pet healthcare purposes.</P>
      <H>Subscription</H>
      <P>Individual plan covers 1 pet. Family plan covers up to 4 pets. Subscriptions renew automatically unless cancelled before the renewal date.</P>
      <H>Reviews</H>
      <P>Reviews must be truthful and respectful. We may remove reviews that contain abusive, defamatory, or unlawful content.</P>
      <H>Medical disclaimer</H>
      <P>PetCareBuddy provides educational pet health information and preventive recommendations. PetCareBuddy does not replace licensed veterinarians.</P>
      <H>Liability</H>
      <P>To the maximum extent permitted by law, PetCareBuddy is not liable for any indirect or consequential loss arising from use of the app.</P>
    </LegalShell>
  );
}
