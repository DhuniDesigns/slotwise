"use client";

import { useEffect, useId, useState } from "react";
import { useAppStore } from "@/components/app-provider";
import { Icon } from "@/components/icons";
import type { AppointmentType } from "@/lib/mock-data";

const blank: AppointmentType = { id: "", name: "", description: "", duration: 30, location: "Google Meet", active: true, color: "#171717" };

export default function AppointmentTypesPage() {
  const { appointmentTypes, saveAppointmentType, deleteAppointmentType } = useAppStore();
  const [editing, setEditing] = useState<AppointmentType | null>(null);
  const [copied, setCopied] = useState("");
  const generatedId = useId().replaceAll(":", "");
  useEffect(() => {
    if (!editing) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    function onKeyDown(event: KeyboardEvent) { if (event.key === "Escape") setEditing(null); }
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [editing]);
  function save(formData: FormData) {
    if (!editing) return;
    saveAppointmentType({ ...editing, id: editing.id || `type-${generatedId}-${appointmentTypes.length + 1}`, name: String(formData.get("name")), description: String(formData.get("description")), duration: Number(formData.get("duration")), location: String(formData.get("location")) });
    setEditing(null);
  }
  return <>
    <div className="dashboard-heading"><div><p className="eyebrow">Your services</p><h1>Appointment types</h1><p className="muted">Create and manage the sessions clients can book.</p></div><button onClick={() => setEditing(blank)}><Icon name="plus" size={15} />New appointment type</button></div>
    <div className="type-grid">{appointmentTypes.map((type) => <article className={`type-card ${!type.active ? "inactive" : ""}`} key={type.id}><div className="type-card-top"><span className="type-icon"><Icon name="diamond" /></span><label className="switch"><input aria-label={`${type.name} active`} type="checkbox" checked={type.active} onChange={() => saveAppointmentType({ ...type, active: !type.active })} /><span /></label></div><div><span className={`status ${type.active ? "confirmed" : "cancelled"}`}>{type.active ? "Active" : "Inactive"}</span><h2>{type.name}</h2><p>{type.description}</p></div><div className="type-meta"><span><Icon name="clock" size={13} />{type.duration} min</span><span><Icon name="location" size={13} />{type.location}</span></div><div className="type-actions"><button className="secondary" onClick={() => setEditing(type)}>Edit</button><button className="secondary icon-only" onClick={() => { navigator.clipboard?.writeText(`http://localhost:3000/book/maya?type=${type.id}`); setCopied(type.id); setTimeout(() => setCopied(""), 1500); }} aria-label={`Copy ${type.name} link`}>{copied === type.id ? <Icon name="check" /> : <Icon name="copy" />}</button></div></article>)}</div>
    <section className="share-banner"><span className="share-art"><Icon name="external" /></span><div><h2>Your booking page is live</h2><p>Share one link and let clients choose the session that suits them.</p></div><code>slotwise.app/maya</code><button className="secondary" onClick={() => navigator.clipboard?.writeText("http://localhost:3000/book/maya")}>Copy link</button></section>
    {editing && <div className="modal-backdrop" onMouseDown={() => setEditing(null)}><form className="form-modal" action={save} onMouseDown={(event) => event.stopPropagation()}><div className="drawer-head"><div><p className="eyebrow">Appointment type</p><h2>{editing.id ? "Edit session" : "Create a session"}</h2></div><button type="button" className="icon-button" aria-label="Close" onClick={() => setEditing(null)}><Icon name="close" /></button></div><label>Name<input name="name" defaultValue={editing.name} placeholder="e.g. Strategy session" required /></label><label>Description<textarea name="description" defaultValue={editing.description} rows={3} placeholder="What can clients expect?" required /></label><div className="field-grid"><label>Duration<select name="duration" defaultValue={editing.duration}><option value="20">20 minutes</option><option value="30">30 minutes</option><option value="45">45 minutes</option><option value="60">60 minutes</option></select></label><label>Location<select name="location" defaultValue={editing.location}><option>Google Meet</option><option>Zoom</option><option>Phone call</option><option>In person</option></select></label></div><div className="color-picker"><span>Tone</span>{["#171717", "#525252", "#737373", "#A3A3A3"].map((color) => <button type="button" className={editing.color === color ? "selected" : ""} style={{ background: color }} onClick={() => setEditing({ ...editing, color })} aria-label={`Use ${color}`} key={color} />)}</div><div className="drawer-actions">{editing.id && <button type="button" className="danger-link" onClick={() => { deleteAppointmentType(editing.id); setEditing(null); }}>Delete</button>}<span className="spacer"/><button type="button" className="secondary" onClick={() => setEditing(null)}>Cancel</button><button>Save appointment type</button></div></form></div>}
  </>;
}
