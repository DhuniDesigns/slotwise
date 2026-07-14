"use client";

import { useId, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useAppStore } from "@/components/app-provider";
import { availableTimes, weekDates } from "@/lib/mock-data";

type Step = "service" | "datetime" | "details";

export function BookingFlow({ slug }: { slug: string }) {
  const router = useRouter();
  const { appointmentTypes, appointments, addAppointment } = useAppStore();
  const activeTypes = appointmentTypes.filter((type) => type.active);
  const [step, setStep] = useState<Step>("service");
  const [typeId, setTypeId] = useState(activeTypes[0]?.id ?? "");
  const [date, setDate] = useState(weekDates[1].iso);
  const [time, setTime] = useState("");
  const [saving, setSaving] = useState(false);
  const bookingId = useId().replaceAll(":", "");
  const selectedType = activeTypes.find((type) => type.id === typeId) ?? activeTypes[0];
  const zone = useMemo(() => Intl.DateTimeFormat().resolvedOptions().timeZone, []);
  const taken = appointments.filter((item) => item.date === date && item.status === "confirmed").map((item) => item.time);

  function chooseType(id: string) {
    setTypeId(id);
    setTime("");
    setStep("datetime");
  }

  function chooseTime(value: string) {
    setTime(value);
    setStep("details");
  }

  async function submit(formData: FormData) {
    if (!selectedType || !time) return;
    setSaving(true);
    const id = `apt-${bookingId}-${appointments.length + 1}`;
    const guest = String(formData.get("name"));
    addAppointment({
      id,
      title: selectedType.name,
      typeId: selectedType.id,
      guest,
      email: String(formData.get("email")),
      date,
      time,
      duration: selectedType.duration,
      status: "confirmed",
      note: String(formData.get("note") || ""),
      location: selectedType.location,
    });
    await new Promise((resolve) => setTimeout(resolve, 450));
    const query = new URLSearchParams({ guest, type: selectedType.name, date, time, duration: String(selectedType.duration), location: selectedType.location, zone });
    router.push(`/book/${slug}/confirmation/${id}?${query.toString()}`);
  }

  return (
    <div className="booking-frame">
      <aside className="booking-summary">
        <div className="host-avatar">MO</div>
        <div><p className="booking-host">Maya Okafor</p><p className="muted compact">Independent brand strategist</p></div>
        <div className="summary-divider" />
        {selectedType && <div className="selection-summary">
          <span className="service-dot" style={{ background: selectedType.color }} />
          <div><strong>{selectedType.name}</strong><p className="muted compact">{selectedType.duration} minutes · {selectedType.location}</p></div>
        </div>}
        {step !== "service" && <div className="booking-fact"><span>◇</span><div><strong>{date ? new Date(`${date}T12:00:00`).toLocaleDateString("en", { weekday: "long", month: "long", day: "numeric" }) : "Choose a date"}</strong>{time && <p className="muted compact">{time} · {zone}</p>}</div></div>}
        <div className="booking-note"><span>✦</span><p>This booking page is connected to Maya’s Slotwise dashboard. Confirmed appointments appear in the dashboard instantly.</p></div>
      </aside>

      <section className="booking-panel">
        <div className="booking-progress" aria-label="Booking progress">
          {[["service", "Service"], ["datetime", "Time"], ["details", "Details"]].map(([key, label], index) => <div className={`progress-item ${step === key ? "current" : ""}`} key={key}><span>{index + 1}</span>{label}</div>)}
        </div>

        {step === "service" && <div className="booking-stage">
          <div><p className="eyebrow">Let’s Get You Booked</p><h1 className="booking-title">What would you like to schedule?</h1><p className="muted">Choose the session that best fits what you need.</p></div>
          <div className="service-list">{activeTypes.map((type) => <button className="service-card" onClick={() => chooseType(type.id)} aria-label={`Book ${type.name}, ${type.duration} minutes`} key={type.id}>
            <span className="service-icon" style={{ background: `${type.color}18`, color: type.color }}>↗</span>
            <span className="service-copy"><strong>{type.name}</strong><small>{type.description}</small><span>{type.duration} min · {type.location}</span></span>
            <span className="arrow">→</span>
          </button>)}</div>
        </div>}

        {step === "datetime" && <div className="booking-stage">
          <button className="text-button back-link inline-back" onClick={() => setStep("service")}>← Change Service</button>
          <div><p className="eyebrow">Choose a Time</p><h1 className="booking-title">July 2026</h1><p className="muted">All times shown in {zone}</p></div>
          <div className="date-strip" aria-label="Available dates">{weekDates.map((item) => <button className={`date-choice ${date === item.iso ? "selected" : ""}`} aria-pressed={date === item.iso} onClick={() => { setDate(item.iso); setTime(""); }} key={item.iso}><small>{item.short}</small><strong>{item.day}</strong></button>)}</div>
          <div className="time-section"><div className="time-heading"><strong>{new Date(`${date}T12:00:00`).toLocaleDateString("en", { weekday: "long", month: "long", day: "numeric" })}</strong><span className="pill">{availableTimes.length - taken.length} times</span></div>
            <div className="time-grid">{availableTimes.map((slot) => { const unavailable = taken.includes(slot); return <button disabled={unavailable} className={`time-choice ${time === slot ? "selected" : ""}`} aria-pressed={time === slot} onClick={() => chooseTime(slot)} key={slot}>{slot}{unavailable && <small>Booked</small>}</button>; })}</div>
          </div>
        </div>}

        {step === "details" && <div className="booking-stage">
          <button className="text-button back-link inline-back" onClick={() => setStep("datetime")}>← Choose Another Time</button>
          <div><p className="eyebrow">Almost There</p><h1 className="booking-title">Tell Maya a little about you.</h1><p className="muted">Your details are only shared with Maya for this appointment.</p></div>
          <form className="booking-form" action={submit}>
            <div className="field-grid">
              <label>Full Name<input name="name" autoComplete="name" placeholder="Ada Lovelace…" required /></label>
              <label>Email Address<input name="email" type="email" autoComplete="email" spellCheck={false} placeholder="ada@example.com…" required /></label>
            </div>
            <label>Anything Maya should know? <span className="optional">Optional</span><textarea name="note" rows={4} autoComplete="off" placeholder="A little context helps make the session more useful…" /></label>
            <label className="checkbox-row"><input name="email-consent" type="checkbox" required /><span>I agree to receive emails about this appointment.</span></label>
            <button className="wide-button" disabled={saving} aria-live="polite">{saving ? <><span className="button-spinner" />Confirming Appointment…</> : `Confirm Booking · ${time}`}</button>
          </form>
        </div>}
      </section>
    </div>
  );
}
