"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useAppStore } from "@/components/app-provider";
import { Icon } from "@/components/icons";
import { availableTimes, weekDates, type Appointment } from "@/lib/mock-data";

type Filter = "upcoming" | "cancelled" | "all";

const filterLabels: Record<Filter, string> = {
  upcoming: "Upcoming",
  cancelled: "Cancelled",
  all: "All",
};
const demoToday = "2026-07-13";

function appointmentStamp(appointment: Appointment) {
  return `${appointment.date}T${appointment.time}:00`;
}

function formatDate(date: string, options: Intl.DateTimeFormatOptions) {
  return new Date(`${date}T12:00`).toLocaleDateString("en", options);
}

function initials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2);
}

function sortBySchedule(items: Appointment[]) {
  return items.slice().sort((a, b) => appointmentStamp(a).localeCompare(appointmentStamp(b)));
}

export default function AppointmentsPage() {
  const { appointments, cancelAppointment, rescheduleAppointment } = useAppStore();
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<Filter>("upcoming");
  const [selected, setSelected] = useState<Appointment | null>(null);
  const [mode, setMode] = useState<"details" | "reschedule" | "cancel">("details");
  const [newDate, setNewDate] = useState(weekDates[2].iso);
  const [newTime, setNewTime] = useState(availableTimes[0]);
  const [cancellationReason, setCancellationReason] = useState("");
  const [toast, setToast] = useState("");
  const deepLinkHandled = useRef(false);

  const confirmed = useMemo(() => sortBySchedule(appointments.filter((item) => item.status === "confirmed")), [appointments]);
  const cancelled = useMemo(() => appointments.filter((item) => item.status === "cancelled"), [appointments]);
  const totalMinutes = confirmed.reduce((total, item) => total + item.duration, 0);
  const nextAppointment = confirmed.find((item) => appointmentStamp(item) >= `${demoToday}T00:00`) ?? confirmed[0];
  const todayCount = confirmed.filter((item) => item.date === demoToday).length;
  const filterCounts: Record<Filter, number> = {
    upcoming: confirmed.length,
    cancelled: cancelled.length,
    all: appointments.length,
  };

  useEffect(() => {
    if (deepLinkHandled.current) return;
    const id = new URLSearchParams(window.location.search).get("open");
    if (id) {
      deepLinkHandled.current = true;
      const timeout = window.setTimeout(() => setSelected(appointments.find((item) => item.id === id) ?? null), 0);
      return () => window.clearTimeout(timeout);
    }
  }, [appointments]);

  useEffect(() => {
    if (!toast) return;
    const timeout = window.setTimeout(() => setToast(""), 4200);
    return () => window.clearTimeout(timeout);
  }, [toast]);

  useEffect(() => {
    if (!selected) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") close();
    }
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [selected]);

  const visible = useMemo(() => {
    return sortBySchedule(
      appointments.filter((item) => {
        const matches = `${item.title} ${item.guest} ${item.email} ${item.location}`.toLowerCase().includes(query.toLowerCase());
        const statusMatches = filter === "all" || (filter === "cancelled" ? item.status === "cancelled" : item.status === "confirmed");
        return matches && statusMatches;
      }),
    );
  }, [appointments, query, filter]);

  function close() {
    setSelected(null);
    setMode("details");
    setCancellationReason("");
  }

  function openAppointment(appointment: Appointment) {
    setSelected(appointment);
    setMode("details");
    setNewDate(appointment.date);
    setNewTime(appointment.time);
  }

  function confirmCancel() {
    if (!selected || cancellationReason.trim().length < 3) return;
    cancelAppointment(selected.id);
    setToast("Appointment cancelled. The time is available again.");
    close();
  }

  function confirmReschedule() {
    if (!selected) return;
    rescheduleAppointment(selected.id, newDate, newTime);
    setToast("Appointment rescheduled. The updated confirmation is ready.");
    close();
  }

  return (
    <>
      <div className="appointments-page">
        <div className="appointments-hero">
          <div>
            <p className="eyebrow">Schedule</p>
            <h1>Appointments</h1>
            <p className="muted">A focused view for reviewing client sessions, timing changes, and cancellations.</p>
          </div>
          <div className="appointments-hero-actions">
            <Link className="button secondary" href="/dashboard/calendar">
              <Icon name="calendar" size={15} />
              Calendar
            </Link>
            <Link className="button" href="/book/maya">
              <Icon name="plus" size={15} />
              Add appointment
            </Link>
          </div>
        </div>

        <section className="appointments-overview" aria-label="Appointment summary">
          <article className="appointment-stat primary">
            <span>Next session</span>
            <strong>{nextAppointment ? nextAppointment.time : "—"}</strong>
            <small>{nextAppointment ? `${formatDate(nextAppointment.date, { month: "short", day: "numeric" })} · ${nextAppointment.guest}` : "No confirmed sessions"}</small>
          </article>
          <article className="appointment-stat">
            <span>Confirmed</span>
            <strong>{confirmed.length}</strong>
            <small>{todayCount} scheduled today</small>
          </article>
          <article className="appointment-stat">
            <span>Hours booked</span>
            <strong>{(totalMinutes / 60).toFixed(1)}</strong>
            <small>Across active appointments</small>
          </article>
          <article className="appointment-stat">
            <span>Cancelled</span>
            <strong>{cancelled.length}</strong>
            <small>Slots reopened automatically</small>
          </article>
        </section>

        {toast && (
          <div className="toast appointment-toast" role="status">
            <Icon name="check" size={15} />
            {toast}
            <button onClick={() => setToast("")} aria-label="Dismiss">
              <Icon name="close" size={14} />
            </button>
          </div>
        )}

        <section className="surface appointments-surface">
          <div className="appointments-commandbar">
            <div>
              <h2>Client sessions</h2>
              <p>{visible.length} shown · Africa/Lagos timezone</p>
            </div>
            <label className="search-input appointment-search">
              <Icon name="search" size={15} />
              <input suppressHydrationWarning value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search client, email, session, location…" />
            </label>
            <div className="segmented appointment-segmented" aria-label="Appointment filter">
              {(Object.keys(filterLabels) as Filter[]).map((item) => (
                <button className={filter === item ? "active" : ""} onClick={() => setFilter(item)} aria-label={filterLabels[item]} key={item}>
                  <span>{filterLabels[item]}</span>
                  <i aria-hidden="true">{filterCounts[item]}</i>
                </button>
              ))}
            </div>
          </div>

          <div className="appointments-list" aria-label="Appointment list">
            {visible.map((item) => (
              <button className={`table-row appointment-record ${item.status}`} onClick={() => openAppointment(item)} key={item.id}>
                <span className="appointment-date-lockup">
                  <strong>{formatDate(item.date, { day: "2-digit" })}</strong>
                  <small>{formatDate(item.date, { month: "short" })}</small>
                </span>
                <span className="appointment-record-main">
                  <span className={`status ${item.status}`}>{item.status}</span>
                  <strong>{item.title}</strong>
                  <small>{item.note || "No note added."}</small>
                </span>
                <span className="appointment-record-time">
                  <Icon name="clock" size={14} />
                  <span>
                    <strong>{item.time}</strong>
                    <small>{item.duration} min · {item.location}</small>
                  </span>
                </span>
                <span className="appointment-record-client">
                  <span className="guest-avatar">{initials(item.guest)}</span>
                  <span>
                    <strong>{item.guest}</strong>
                    <small>{item.email}</small>
                  </span>
                </span>
                <span className="row-arrow">
                  <Icon name="chevron" size={15} />
                </span>
              </button>
            ))}
          </div>

          {visible.length === 0 && (
            <div className="empty-state appointment-empty">
              <Icon name="search" size={24} />
              <h3>No appointments found</h3>
              <p>Try a different search or filter. Confirmed and cancelled sessions stay searchable here.</p>
            </div>
          )}
        </section>
      </div>

      {selected && (
        <div className="modal-backdrop" role="presentation" onMouseDown={close}>
          <section className="detail-drawer appointment-drawer" role="dialog" aria-modal="true" aria-label="Appointment details" onMouseDown={(event) => event.stopPropagation()}>
            <div className="drawer-head appointment-drawer-head">
              <div>
                <span className={`status ${selected.status}`}>{selected.status}</span>
                <h2>{mode === "reschedule" ? "Reschedule appointment" : mode === "cancel" ? "Cancel appointment" : selected.title}</h2>
                <p>{selected.guest} · {selected.duration} minutes</p>
              </div>
              <button className="icon-button" onClick={close} aria-label="Close">
                <Icon name="close" />
              </button>
            </div>

            {mode === "details" && (
              <>
                <div className="appointment-drawer-when">
                  <div className="appointment-drawer-date">
                    <strong>{formatDate(selected.date, { day: "2-digit" })}</strong>
                    <small>{formatDate(selected.date, { month: "short" })}</small>
                  </div>
                  <div>
                    <strong>{formatDate(selected.date, { weekday: "long", month: "long", day: "numeric" })}</strong>
                    <p>{selected.time} · {selected.duration} minutes · Africa/Lagos</p>
                  </div>
                </div>

                <div className="appointment-drawer-client">
                  <span className="guest-avatar large">{initials(selected.guest)}</span>
                  <div>
                    <small>Client</small>
                    <strong>{selected.guest}</strong>
                    <p>{selected.email}</p>
                  </div>
                </div>

                <div className="detail-grid appointment-detail-grid">
                  <div>
                    <small>Location</small>
                    <strong>{selected.location}</strong>
                  </div>
                  <div>
                    <small>Appointment type</small>
                    <strong>{selected.title}</strong>
                  </div>
                </div>

                <div className="detail-block appointment-note">
                  <small>Client note</small>
                  <p>{selected.note || "No note was added."}</p>
                </div>

                {selected.status === "confirmed" && (
                  <div className="drawer-actions appointment-drawer-actions">
                    <button className="secondary" onClick={() => setMode("reschedule")}>Reschedule</button>
                    <button className="danger-button" onClick={() => setMode("cancel")}>Cancel appointment</button>
                  </div>
                )}
              </>
            )}

            {mode === "reschedule" && (
              <div className="drawer-form appointment-drawer-form">
                <p className="muted">Choose a new date and time. The client will receive an updated confirmation.</p>
                <label>
                  New date
                  <select value={newDate} onChange={(event) => setNewDate(event.target.value)}>
                    {weekDates.slice(1).map((item) => (
                      <option value={item.iso} key={item.iso}>{item.short}, July {item.day}</option>
                    ))}
                  </select>
                </label>
                <label>
                  New time
                  <select value={newTime} onChange={(event) => setNewTime(event.target.value)}>
                    {availableTimes.map((item) => (
                      <option key={item}>{item}</option>
                    ))}
                  </select>
                </label>
                <div className="drawer-actions appointment-drawer-actions">
                  <button className="secondary" onClick={() => setMode("details")}>Back</button>
                  <button onClick={confirmReschedule}>Confirm new time</button>
                </div>
              </div>
            )}

            {mode === "cancel" && (
              <div className="drawer-form appointment-drawer-form">
                <div className="warning-box">
                  <strong>This will reopen the time slot.</strong>
                  <p>{selected.guest} will receive a cancellation email immediately.</p>
                </div>
                <label>
                  Reason for cancellation
                  <textarea rows={4} value={cancellationReason} onChange={(event) => setCancellationReason(event.target.value)} placeholder="Briefly explain why the appointment is cancelled…" required />
                  <small className="field-hint">Enter at least 3 characters.</small>
                </label>
                <div className="drawer-actions appointment-drawer-actions">
                  <button className="secondary" onClick={() => setMode("details")}>Keep appointment</button>
                  <button className="danger-button solid" disabled={cancellationReason.trim().length < 3} onClick={confirmCancel}>Cancel appointment</button>
                </div>
              </div>
            )}
          </section>
        </div>
      )}
    </>
  );
}
