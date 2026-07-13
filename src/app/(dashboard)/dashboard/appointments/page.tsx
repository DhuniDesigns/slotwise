"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useAppStore } from "@/components/app-provider";
import { Icon } from "@/components/icons";
import { availableTimes, weekDates, type Appointment } from "@/lib/mock-data";

export default function AppointmentsPage() {
  const { appointments, cancelAppointment, rescheduleAppointment } = useAppStore();
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("upcoming");
  const [selected, setSelected] = useState<Appointment | null>(null);
  const [mode, setMode] = useState<"details" | "reschedule" | "cancel">("details");
  const [newDate, setNewDate] = useState(weekDates[2].iso);
  const [newTime, setNewTime] = useState(availableTimes[0]);
  const [cancellationReason, setCancellationReason] = useState("");
  const [toast, setToast] = useState("");
  const deepLinkHandled = useRef(false);

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
      if (event.key === "Escape") {
        setSelected(null);
        setMode("details");
        setCancellationReason("");
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [selected]);

  const visible = useMemo(() => appointments.filter((item) => {
    const matches = `${item.title} ${item.guest} ${item.email}`.toLowerCase().includes(query.toLowerCase());
    return matches && (filter === "all" || (filter === "cancelled" ? item.status === "cancelled" : item.status === "confirmed"));
  }), [appointments, query, filter]);

  function close() { setSelected(null); setMode("details"); setCancellationReason(""); }
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

  return <>
    <div className="dashboard-heading"><div><p className="eyebrow">Schedule</p><h1>Appointments</h1><p className="muted">Review, reschedule, or cancel client sessions.</p></div><Link className="button" href="/book/maya"><Icon name="plus" size={15} />Add appointment</Link></div>
    {toast && <div className="toast" role="status"><Icon name="check" size={15} />{toast}<button onClick={() => setToast("")} aria-label="Dismiss"><Icon name="close" size={14} /></button></div>}
    <section className="surface">
      <div className="list-toolbar"><label className="search-input"><Icon name="search" size={15} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search by client or appointment…" /></label><div className="segmented">{["upcoming", "cancelled", "all"].map((item) => <button className={filter === item ? "active" : ""} onClick={() => setFilter(item)} key={item}>{item[0].toUpperCase() + item.slice(1)}</button>)}</div></div>
      <div className="data-table"><div className="table-head"><span>Date & time</span><span>Appointment</span><span>Client</span><span>Status</span><span /></div>{visible.map((item) => <button className="table-row" onClick={() => { setSelected(item); setMode("details"); }} key={item.id}>
        <span className="date-cell"><strong>{new Date(`${item.date}T12:00`).toLocaleDateString("en", { month: "short", day: "numeric" })}</strong><small>{item.time} · {item.duration} min</small></span>
        <span><strong>{item.title}</strong><small>{item.location}</small></span>
        <span className="client-cell"><span className="guest-avatar">{item.guest.split(" ").map((part) => part[0]).join("").slice(0, 2)}</span><span><strong>{item.guest}</strong><small>{item.email}</small></span></span>
        <span><span className={`status ${item.status}`}>{item.status}</span></span><span className="row-arrow"><Icon name="chevron" size={15} /></span>
      </button>)}</div>
      {visible.length === 0 && <div className="empty-state"><Icon name="search" size={24} /><h3>No appointments found</h3><p>Try a different search or filter.</p></div>}
    </section>

    {selected && <div className="modal-backdrop" role="presentation" onMouseDown={close}><section className="detail-drawer" role="dialog" aria-modal="true" aria-label="Appointment details" onMouseDown={(event) => event.stopPropagation()}>
      <div className="drawer-head"><div><span className={`status ${selected.status}`}>{selected.status}</span><h2>{mode === "reschedule" ? "Reschedule appointment" : mode === "cancel" ? "Cancel appointment" : selected.title}</h2></div><button className="icon-button" onClick={close} aria-label="Close"><Icon name="close" /></button></div>
      {mode === "details" && <><div className="drawer-date"><span className="detail-icon"><Icon name="calendar" size={15} /></span><div><strong>{new Date(`${selected.date}T12:00`).toLocaleDateString("en", { weekday: "long", month: "long", day: "numeric" })}</strong><p>{selected.time} · {selected.duration} minutes · Africa/Lagos</p></div></div><div className="detail-block"><small>Client</small><div className="client-profile"><span className="guest-avatar large">{selected.guest.split(" ").map((part) => part[0]).join("").slice(0, 2)}</span><div><strong>{selected.guest}</strong><p>{selected.email}</p></div></div></div><div className="detail-grid"><div><small>Location</small><strong>{selected.location}</strong></div><div><small>Appointment type</small><strong>{selected.title}</strong></div></div><div className="detail-block"><small>Client note</small><p>{selected.note || "No note was added."}</p></div>{selected.status === "confirmed" && <div className="drawer-actions"><button className="secondary" onClick={() => setMode("reschedule")}>Reschedule</button><button className="danger-button" onClick={() => setMode("cancel")}>Cancel appointment</button></div>}</>}
      {mode === "reschedule" && <div className="drawer-form"><p className="muted">Choose a new date and time. The client will receive an updated confirmation.</p><label>New date<select value={newDate} onChange={(event) => setNewDate(event.target.value)}>{weekDates.slice(1).map((item) => <option value={item.iso} key={item.iso}>{item.short}, July {item.day}</option>)}</select></label><label>New time<select value={newTime} onChange={(event) => setNewTime(event.target.value)}>{availableTimes.map((item) => <option key={item}>{item}</option>)}</select></label><div className="drawer-actions"><button className="secondary" onClick={() => setMode("details")}>Back</button><button onClick={confirmReschedule}>Confirm new time</button></div></div>}
      {mode === "cancel" && <div className="drawer-form"><div className="warning-box"><strong>This will reopen the time slot.</strong><p>{selected.guest} will receive a cancellation email immediately.</p></div><label>Reason for cancellation<textarea rows={4} value={cancellationReason} onChange={(event) => setCancellationReason(event.target.value)} placeholder="Briefly explain why the appointment is cancelled…" required /><small className="field-hint">Enter at least 3 characters.</small></label><div className="drawer-actions"><button className="secondary" onClick={() => setMode("details")}>Keep appointment</button><button className="danger-button solid" disabled={cancellationReason.trim().length < 3} onClick={confirmCancel}>Cancel appointment</button></div></div>}
    </section></div>}
  </>;
}
