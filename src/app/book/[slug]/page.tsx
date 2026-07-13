import { BookingFlow } from "@/components/booking/booking-flow";
import { BrandMark } from "@/components/icons";

export const metadata = { title: "Book an appointment" };
export default async function BookingPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return <main className="booking-page"><div className="booking-brand"><BrandMark /><strong>Slotwise</strong><span className="muted">Booking for Maya Okafor</span></div><BookingFlow slug={slug}/><p className="booking-footer">Powered by <strong>Slotwise</strong> · Privacy · Terms</p></main>;
}
