"use client";

import Link from "next/link";
import { useAppStore } from "@/components/app-provider";
import { Icon } from "@/components/icons";

export default function OverviewPage() {
  const { appointments, appointmentTypes } = useAppStore();
  const active = appointments.filter((item) => item.status === "confirmed");
  const upcoming = active.slice().sort((a, b) => `${a.date}${a.time}`.localeCompare(`${b.date}${b.time}`)).slice(0, 4);
  return <>
    <div className="dashboard-heading"><div><p className="eyebrow">Tuesday, July 7</p><h1>Good afternoon, Maya.</h1><p className="muted">Here’s what’s happening with your schedule.</p></div><Link className="button" href="/book/maya"><Icon name="plus" size={15} />Create booking</Link></div>
    <section className="metric-grid">
      <article className="metric-card"><div className="metric-icon"><Icon name="calendar" size={16} /></div><div><span>Appointments this week</span><strong>{active.length}</strong><small className="positive">12% more than last week</small></div></article>
      <article className="metric-card"><div className="metric-icon"><Icon name="clock" size={16} /></div><div><span>Hours booked</span><strong>{(active.reduce((total, item) => total + item.duration, 0) / 60).toFixed(1)}</strong><small>Across {active.length} appointments</small></div></article>
      <article className="metric-card"><div className="metric-icon"><Icon name="diamond" size={16} /></div><div><span>Active booking types</span><strong>{appointmentTypes.filter((item) => item.active).length}</strong><small>All accepting bookings</small></div></article>
      <article className="metric-card"><div className="metric-icon"><Icon name="external" size={16} /></div><div><span>Booking page views</span><strong>148</strong><small className="positive">24% more this month</small></div></article>
    </section>
    <div className="overview-grid">
      <section className="surface"><div className="surface-heading"><div><h2>Upcoming appointments</h2><p>Everything on your near-term schedule.</p></div><Link href="/dashboard/appointments">View all →</Link></div>
        <div className="appointment-list">{upcoming.map((item) => <Link href={`/dashboard/appointments?open=${item.id}`} className="appointment-row" key={item.id}><div className="date-tile"><strong>{new Date(`${item.date}T12:00`).toLocaleDateString("en", { day: "2-digit" })}</strong><small>{new Date(`${item.date}T12:00`).toLocaleDateString("en", { month: "short" })}</small></div><div className="appointment-main"><strong>{item.title}</strong><span>{item.time} · {item.duration} min</span></div><div className="guest-cell"><span className="guest-avatar">{item.guest.split(" ").map((part) => part[0]).join("").slice(0, 2)}</span><span>{item.guest}</span></div><span className="row-arrow"><Icon name="chevron" size={15} /></span></Link>)}</div>
      </section>
      <aside className="surface schedule-card"><div className="surface-heading"><div><h2>Today</h2><p>July 7</p></div><span className="pill">2 sessions</span></div><div className="timeline"><div className="timeline-hour">09:00</div><div className="timeline-line"/><div className="timeline-hour">10:00</div><div className="timeline-event"><strong>Brand consultation</strong><span>Amara Kalu · 30 min</span></div><div className="timeline-hour">12:00</div><div className="timeline-line"/><div className="timeline-hour">14:00</div><div className="timeline-event pale"><strong>Focus time</strong><span>14:00–16:00</span></div></div><Link className="button secondary full-width" href="/dashboard/calendar">Open calendar</Link></aside>
    </div>
  </>;
}
