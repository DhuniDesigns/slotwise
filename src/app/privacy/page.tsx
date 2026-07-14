import Link from "next/link";
import { BrandMark } from "@/components/icons";

export const metadata = { title: "Privacy Policy" };

export default function PrivacyPage() {
  return (
    <main className="policy-page shell">
      <Link className="brand policy-brand" href="/"><BrandMark />Slotwise</Link>
      <section className="policy-card">
        <Link className="back-link" href="/login">← Back to Sign In</Link>
        <p className="eyebrow">Privacy Policy</p>
        <h1>Your scheduling data stays intentionally limited.</h1>
        <p className="lede">Slotwise only asks for the information needed to create, manage, and confirm appointments: account details, booking details, availability, and communication preferences.</p>
        <div className="policy-grid">
          <article><h2>What We Collect</h2><p>Email addresses, names, appointment details, availability settings, and optional notes shared during booking.</p></article>
          <article><h2>How We Use It</h2><p>To authenticate users, show availability, create bookings, send confirmations, and help you manage your workspace.</p></article>
          <article><h2>Your Choices</h2><p>You can request deletion, update your account details, and control notification preferences from your workspace settings.</p></article>
        </div>
      </section>
    </main>
  );
}
