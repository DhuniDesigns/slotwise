import Link from "next/link";
import { BookingFlow } from "@/components/booking/booking-flow";
import { BrandMark } from "@/components/icons";

export const metadata = { title: "Book an appointment" };

export default async function BookingPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  return (
    <main className="booking-page">
      <div className="public-product-bar">
        <Link className="booking-brand connected" href="/">
          <BrandMark />
          <strong>Slotwise</strong>
          <span className="muted">Booking for Maya Okafor</span>
        </Link>
        <nav aria-label="Booking page navigation">
          <Link className="back-link" href="/dashboard">← Back to Dashboard</Link>
          <Link className="button secondary compact-button" href="/dashboard/availability">Manage Availability</Link>
        </nav>
      </div>
      <BookingFlow slug={slug} />
      <p className="booking-footer">Powered by <strong>Slotwise</strong> · Privacy · Terms</p>
    </main>
  );
}
