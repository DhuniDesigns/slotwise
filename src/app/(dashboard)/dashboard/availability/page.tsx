"use client";

import { useState } from "react";

type Day = { name: string; enabled: boolean; start: string; end: string };

const seed: Day[] = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"]
  .map((name) => ({ name, enabled: true, start: "09:00", end: "17:00" }))
  .concat(["Saturday", "Sunday"].map((name) => ({ name, enabled: false, start: "09:00", end: "17:00" })));

export default function AvailabilityPage() {
  const [days, setDays] = useState(seed);
  const [notice, setNotice] = useState("60");
  const [overrides, setOverrides] = useState([{ date: "2026-07-17", label: "Unavailable", detail: "All day" }]);
  const [saved, setSaved] = useState(false);

  function update(index: number, patch: Partial<Day>) {
    setDays((items) => items.map((item, itemIndex) => (itemIndex === index ? { ...item, ...patch } : item)));
    setSaved(false);
  }

  function saveChanges() {
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  return (
    <>
      <div className="dashboard-heading">
        <div>
          <p className="eyebrow">Working hours</p>
          <h1>Availability</h1>
          <p className="muted">Control when clients can book time with you.</p>
        </div>
        <button onClick={saveChanges}>{saved ? "✓ Saved" : "Save changes"}</button>
      </div>

      <div className="settings-layout">
        <div className="settings-main">
          <section className="surface">
            <div className="surface-heading">
              <div>
                <h2>Weekly hours</h2>
                <p>These hours repeat every week in your timezone.</p>
              </div>
              <span className="timezone-chip">Africa/Lagos · GMT+1</span>
            </div>

            <div className="hours-list">
              {days.map((day, index) => (
                <div className="hours-row" key={day.name}>
                  <label className="switch">
                    <input
                      aria-label={`${day.name} availability`}
                      type="checkbox"
                      checked={day.enabled}
                      onClick={(event) => update(index, { enabled: event.currentTarget.checked })}
                      onChange={(event) => update(index, { enabled: event.target.checked })}
                    />
                    <span />
                  </label>
                  <strong>{day.name}</strong>
                  {day.enabled ? (
                    <>
                      <input
                        aria-label={`${day.name} start`}
                        type="time"
                        value={day.start}
                        onChange={(event) => update(index, { start: event.target.value })}
                      />
                      <span className="muted">to</span>
                      <input
                        aria-label={`${day.name} end`}
                        type="time"
                        value={day.end}
                        onChange={(event) => update(index, { end: event.target.value })}
                      />
                    </>
                  ) : (
                    <span className="muted unavailable-label">Unavailable</span>
                  )}
                </div>
              ))}
            </div>
          </section>

          <section className="surface">
            <div className="surface-heading">
              <div>
                <h2>Date overrides</h2>
                <p>Adjust availability for holidays or exceptional days.</p>
              </div>
              <button
                className="secondary"
                onClick={() => setOverrides((items) => [...items, { date: "2026-07-24", label: "Extra hours", detail: "10:00–14:00" }])}
              >
                + Add override
              </button>
            </div>

            <div className="override-list">
              {overrides.map((item, index) => (
                <div className="override-row" key={`${item.date}-${index}`}>
                  <div className="date-tile">
                    <strong>{item.date.slice(-2)}</strong>
                    <small>Jul</small>
                  </div>
                  <div>
                    <strong>{item.label}</strong>
                    <p>{item.detail}</p>
                  </div>
                  <span className="muted">{item.date}</span>
                  <button
                    className="icon-button"
                    onClick={() => setOverrides((items) => items.filter((_, itemIndex) => itemIndex !== index))}
                    aria-label="Remove override"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>

            {overrides.length === 0 && (
              <div className="empty-state">
                <span>◫</span>
                <h3>No date overrides</h3>
                <p>Your weekly schedule applies to every date.</p>
              </div>
            )}
          </section>
        </div>

        <aside className="settings-aside">
          <section className="surface">
            <h3>Booking rules</h3>
            <label>
              Minimum notice
              <select value={notice} onChange={(event) => setNotice(event.target.value)}>
                <option value="30">30 minutes</option>
                <option value="60">1 hour</option>
                <option value="240">4 hours</option>
                <option value="1440">24 hours</option>
              </select>
            </label>
            <label>
              Booking window
              <select defaultValue="60">
                <option value="30">30 days ahead</option>
                <option value="60">60 days ahead</option>
                <option value="90">90 days ahead</option>
              </select>
            </label>
            <label>
              Buffer between sessions
              <select defaultValue="15">
                <option value="0">No buffer</option>
                <option value="15">15 minutes</option>
                <option value="30">30 minutes</option>
              </select>
            </label>
          </section>

          <div className="tip-card">
            <span>✦</span>
            <div>
              <strong>A calmer calendar</strong>
              <p>Adding a 15-minute buffer gives you room for notes and a quick reset.</p>
            </div>
          </div>
        </aside>
      </div>
    </>
  );
}
