"use client";

import { useState } from "react";
import { useAppStore } from "@/components/app-provider";
import { Icon } from "@/components/icons";

export default function SettingsPage() {
  const { resetDemo } = useAppStore();
  const [saved, setSaved] = useState(false);
  const [copied, setCopied] = useState(false);
  function showSaved() { setSaved(true); setTimeout(() => setSaved(false), 1800); }

  return <>
    <div className="dashboard-heading"><div><p className="eyebrow">Workspace</p><h1>Settings</h1><p className="muted">Manage your public profile and booking preferences.</p></div><button onClick={showSaved}>{saved ? <><Icon name="check" size={15} />Changes saved</> : "Save changes"}</button></div>
    <div className="settings-layout"><div className="settings-main">
      <form className="surface profile-form" onSubmit={(event) => { event.preventDefault(); showSaved(); }}>
        <div className="surface-heading"><div><h2>Public profile</h2><p>This is how clients see you on your booking page.</p></div></div>
        <div className="profile-form-body">
          <div className="avatar-editor"><span>MO</span><div><label className="button secondary upload-button">Change photo<input className="visually-hidden" type="file" accept="image/png,image/jpeg" onChange={showSaved} /></label><p>JPG or PNG, up to 2 MB</p></div></div>
          <div className="field-grid"><label>Display name<input defaultValue="Maya Okafor" /></label><label>Booking page slug<div className="input-prefix"><span>slotwise.app/</span><input defaultValue="maya" /></div></label></div>
          <label>Professional headline<input defaultValue="Independent brand strategist" /></label>
          <label>Bio<textarea rows={4} defaultValue="I help thoughtful businesses find their clearest story and express it with confidence." /></label>
          <label>Timezone<select defaultValue="Africa/Lagos"><option>Africa/Lagos (GMT+1)</option><option>Europe/London</option><option>America/New_York</option><option>Asia/Kolkata</option></select></label>
        </div>
      </form>
      <section className="surface"><div className="surface-heading"><div><h2>Email notifications</h2><p>Choose which scheduling updates land in your inbox.</p></div></div><div className="notification-settings"><label><span><strong>New bookings</strong><small>When someone schedules an appointment.</small></span><span className="switch"><input aria-label="New booking emails" type="checkbox" defaultChecked /><span /></span></label><label><span><strong>Cancellations</strong><small>When an appointment is cancelled.</small></span><span className="switch"><input aria-label="Cancellation emails" type="checkbox" defaultChecked /><span /></span></label><label><span><strong>Weekly summary</strong><small>A Monday overview of your upcoming week.</small></span><span className="switch"><input aria-label="Weekly summary emails" type="checkbox" /><span /></span></label></div></section>
    </div><aside className="settings-aside">
      <section className="surface booking-link-card"><h3>Your booking link</h3><p>Share this anywhere clients find you.</p><code>slotwise.app/maya</code><button className="secondary" onClick={() => { navigator.clipboard?.writeText("http://localhost:3000/book/maya"); setCopied(true); setTimeout(() => setCopied(false), 1500); }}>{copied ? <><Icon name="check" size={14} />Copied</> : <><Icon name="copy" size={14} />Copy booking link</>}</button></section>
      <section className="surface danger-zone"><h3>Demo controls</h3><p>Restore appointments and services to their original mock data.</p><button className="danger-button" onClick={() => { resetDemo(); showSaved(); }}>Reset demo data</button></section>
    </aside></div>
  </>;
}
