"use client";

import Link from "next/link";
import { useState } from "react";
import { useAppStore } from "@/components/app-provider";
import { Icon } from "@/components/icons";

const monthDays = Array.from({ length: 35 }, (_, index) => index - 1);

export default function CalendarPage() {
  const { appointments } = useAppStore();
  const [view, setView] = useState<"month" | "week" | "agenda">("week");
  const [weekOffset, setWeekOffset] = useState(0);
  const active = appointments.filter((item) => item.status === "confirmed");
  const weekStart = new Date(Date.UTC(2026, 6, 6 + weekOffset * 7));
  const calendarDays = Array.from({ length: 7 }, (_, index) => {
    const date = new Date(weekStart); date.setUTCDate(date.getUTCDate() + index);
    return { iso: date.toISOString().slice(0, 10), short: date.toLocaleDateString("en", { weekday: "short", timeZone: "UTC" }), day: date.getUTCDate() };
  });
  const rangeLabel = `${weekStart.toLocaleDateString("en", { month: "short", day: "numeric", timeZone: "UTC" })} – ${new Date(Date.UTC(weekStart.getUTCFullYear(), weekStart.getUTCMonth(), weekStart.getUTCDate() + 6)).toLocaleDateString("en", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" })}`;
  return <>
    <div className="dashboard-heading calendar-heading"><div><p className="eyebrow">Your schedule</p><h1>Calendar</h1><p className="muted">All appointment times in Africa/Lagos.</p></div><div className="calendar-actions"><button className="secondary" onClick={() => setWeekOffset(0)}>Today</button><div className="pager"><button aria-label="Previous week" onClick={() => setWeekOffset((offset) => offset - 1)}>‹</button><strong>{rangeLabel}</strong><button aria-label="Next week" onClick={() => setWeekOffset((offset) => offset + 1)}>›</button></div><Link className="button" href="/book/maya">+ New booking</Link></div></div>
    <section className="surface calendar-surface"><div className="calendar-toolbar"><div className="segmented">{(["month", "week", "agenda"] as const).map((item) => <button className={view === item ? "active" : ""} onClick={() => setView(item)} key={item}>{item[0].toUpperCase() + item.slice(1)}</button>)}</div><div className="legend"><span><i className="green-dot" />Consultation</span><span><i className="clay-dot" />Portfolio</span><span><i className="blue-dot" />Discovery</span></div></div>
      {view === "week" && <div className="week-calendar"><div className="week-corner" />{calendarDays.map((day) => <div className={`week-day-head ${day.iso === "2026-07-07" ? "today" : ""}`} key={day.iso}><small>{day.short}</small><strong>{day.day}</strong></div>)}
        {Array.from({ length: 10 }, (_, row) => { const hour = row + 8; return <div className="week-row" style={{ gridRow: row + 2 }} key={hour}><span className="hour-label">{String(hour).padStart(2, "0")}:00</span>{calendarDays.map((day) => <div className="hour-cell" key={day.iso} />)}</div>; })}
        {active.filter((item) => item.date >= calendarDays[0].iso && item.date <= calendarDays[6].iso).map((item) => { const day = new Date(`${item.date}T12:00`).getDay(); const column = day === 0 ? 8 : day + 1; const hour = Number(item.time.split(":")[0]); const minute = Number(item.time.split(":")[1]); return <Link href={`/dashboard/appointments?open=${item.id}`} className={`calendar-event type-${item.typeId}`} style={{ gridColumn: column, gridRow: `${hour - 6} / span ${item.duration >= 60 ? 2 : 1}`, marginTop: `${minute / 60 * 58}px` }} key={item.id}><strong>{item.time}</strong><span>{item.title}</span><small>{item.guest}</small></Link>; })}
      </div>}
      {view === "month" && <div className="month-calendar">{["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => <div className="month-head" key={day}>{day}</div>)}{monthDays.map((day, index) => <div className={`month-cell ${day < 1 || day > 31 ? "outside" : ""} ${day === 7 ? "today" : ""}`} key={index}><span>{day < 1 ? 30 + day : day > 31 ? day - 31 : day}</span>{active.filter((item) => Number(item.date.slice(-2)) === day).map((item) => <Link href={`/dashboard/appointments?open=${item.id}`} className={`month-event type-${item.typeId}`} key={item.id}>{item.time} {item.guest}</Link>)}</div>)}</div>}
      {view === "agenda" && <div className="agenda-view">{active.slice().sort((a, b) => `${a.date}${a.time}`.localeCompare(`${b.date}${b.time}`)).map((item) => <Link href={`/dashboard/appointments?open=${item.id}`} className="agenda-row" key={item.id}><div className="agenda-date"><strong>{new Date(`${item.date}T12:00`).toLocaleDateString("en", { day: "2-digit" })}</strong><small>{new Date(`${item.date}T12:00`).toLocaleDateString("en", { month: "short" })}</small></div><span className="service-dot" /><div><strong>{item.time} · {item.title}</strong><p>{item.guest} · {item.duration} minutes · {item.location}</p></div><span className="row-arrow"><Icon name="chevron" size={15} /></span></Link>)}</div>}
    </section>
  </>;
}
