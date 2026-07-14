import Link from "next/link";
import { BrandMark } from "@/components/icons";

export const metadata = { title: "Terms of Service" };

export default function TermsPage() {
  return (
    <main className="policy-page shell">
      <Link className="brand policy-brand" href="/"><BrandMark />Slotwise</Link>
      <section className="policy-card">
        <Link className="back-link" href="/login">← Back to Sign In</Link>
        <p className="eyebrow">Terms of Service</p>
        <h1>Use Slotwise to manage bookings responsibly.</h1>
        <p className="lede">These demo terms describe the basic expectations for using Slotwise: keep your account secure, use accurate availability, and respect the people booking time with you.</p>
        <div className="policy-grid">
          <article><h2>Your Account</h2><p>You are responsible for keeping your sign-in details safe and for the activity that happens in your workspace.</p></article>
          <article><h2>Bookings</h2><p>Appointment details should be accurate, timely, and used only for scheduling and communication related to the booking.</p></article>
          <article><h2>Service Changes</h2><p>Slotwise may evolve features, flows, and integrations as the product grows. We’ll keep important changes clear.</p></article>
        </div>
      </section>
    </main>
  );
}
