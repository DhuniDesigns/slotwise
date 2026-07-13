import Link from "next/link";
import { BrandMark } from "@/components/icons";

export const metadata = { title: "Booking confirmed" };

export default async function ConfirmationPage({ params, searchParams }: {
  params: Promise<{ slug: string; appointmentId: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { slug, appointmentId } = await params;
  const query = await searchParams;
  const value = (key: string, fallback: string) => typeof query[key] === "string" ? query[key] as string : fallback;
  const date = value("date", "2026-07-08");
  const time = value("time", "10:30");
  const guest = value("guest", "Guest");
  const type = value("type", "Brand consultation");
  const location = value("location", "Google Meet");
  const zone = value("zone", "Africa/Lagos");
  const calendarData = encodeURIComponent(`BEGIN:VCALENDAR\nVERSION:2.0\nBEGIN:VEVENT\nSUMMARY:${type}\nDTSTART:${date.replaceAll("-", "")}T${time.replace(":", "")}00\nDURATION:PT${value("duration", "30")}M\nLOCATION:${location}\nEND:VEVENT\nEND:VCALENDAR`);

  return <main className="confirmation-page">
    <div className="booking-brand centered"><BrandMark /><strong>Slotwise</strong></div>
    <section className="confirmation-card">
      <div className="success-mark">✓</div>
      <p className="eyebrow">Booking confirmed</p>
      <h1>You’re all set, {guest.split(" ")[0]}.</h1>
      <p className="lede centered-text">A confirmation has been sent to your inbox. Maya is looking forward to meeting you.</p>
      <div className="confirmation-details">
        <div><span className="detail-icon">◫</span><div><small>Appointment</small><strong>{type}</strong><p>Maya Okafor · {value("duration", "30")} minutes</p></div></div>
        <div><span className="detail-icon">◷</span><div><small>Date & time</small><strong>{new Date(`${date}T12:00:00`).toLocaleDateString("en", { weekday: "long", month: "long", day: "numeric", year: "numeric" })}</strong><p>{time} · {zone}</p></div></div>
        <div><span className="detail-icon">⌖</span><div><small>Location</small><strong>{location}</strong><p>Joining instructions are in your email.</p></div></div>
        <div><span className="detail-icon">#</span><div><small>Reference</small><strong>{appointmentId}</strong></div></div>
      </div>
      <div className="actions centered-actions"><a className="button secondary" href={`data:text/calendar;charset=utf-8,${calendarData}`} download="slotwise-appointment.ics">Add to calendar</a><Link className="button" href={`/book/${slug}`}>Book another session</Link></div>
      <p className="confirmation-help">Need to make a change? Reply to your confirmation email to contact Maya.</p>
    </section>
  </main>;
}
