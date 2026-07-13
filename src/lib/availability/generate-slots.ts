export type TimeWindow = { start: string; end: string };
export type BusyPeriod = { startsAt: Date; endsAt: Date };
export type Slot = { startsAt: Date; endsAt: Date };

export type GenerateSlotsInput = {
  date: string;
  hostTimezone: string;
  durationMinutes: number;
  minimumNoticeMinutes: number;
  weeklyWindows: Partial<Record<number, TimeWindow[]>>;
  override?: { unavailable: boolean; windows?: TimeWindow[] };
  busy: BusyPeriod[];
  now?: Date;
  stepMinutes?: number;
};

function localParts(date: Date, timeZone: string) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone, year: "numeric", month: "2-digit", day: "2-digit",
    hour: "2-digit", minute: "2-digit", second: "2-digit", hourCycle: "h23",
  }).formatToParts(date);
  return Object.fromEntries(parts.filter((p) => p.type !== "literal").map((p) => [p.type, p.value]));
}

function localWallTimeToInstant(date: string, time: string, timeZone: string): Date | null {
  const [year, month, day] = date.split("-").map(Number);
  const [hour, minute] = time.split(":").map(Number);
  const target = `${date} ${time}`;
  const center = Date.UTC(year, month - 1, day, hour, minute);
  // Searching real instants avoids silently normalizing nonexistent DST wall times.
  for (let delta = -14 * 60; delta <= 14 * 60; delta += 15) {
    const candidate = new Date(center + delta * 60_000);
    const p = localParts(candidate, timeZone);
    if (`${p.year}-${p.month}-${p.day} ${p.hour}:${p.minute}` === target) return candidate;
  }
  return null;
}

function addLocalMinutes(time: string, minutes: number) {
  const [h, m] = time.split(":").map(Number);
  const total = h * 60 + m + minutes;
  if (total >= 24 * 60) return null;
  return `${String(Math.floor(total / 60)).padStart(2, "0")}:${String(total % 60).padStart(2, "0")}`;
}

function weekday(date: string) {
  return new Date(`${date}T12:00:00Z`).getUTCDay();
}

export function generateSlots(input: GenerateSlotsInput): Slot[] {
  if (input.durationMinutes <= 0) throw new Error("durationMinutes must be positive");
  const now = input.now ?? new Date();
  const earliest = now.getTime() + input.minimumNoticeMinutes * 60_000;
  const windows = input.override
    ? input.override.unavailable ? [] : (input.override.windows ?? [])
    : (input.weeklyWindows[weekday(input.date)] ?? []);
  const step = input.stepMinutes ?? 15;
  const slots: Slot[] = [];

  for (const window of windows) {
    for (let cursor = window.start; cursor < window.end;) {
      const endTime = addLocalMinutes(cursor, input.durationMinutes);
      if (!endTime || endTime > window.end) break; // V1 rejects overnight windows.
      const startsAt = localWallTimeToInstant(input.date, cursor, input.hostTimezone);
      const endsAt = localWallTimeToInstant(input.date, endTime, input.hostTimezone);
      if (startsAt && endsAt && startsAt.getTime() >= earliest) {
        const overlaps = input.busy.some((busy) => startsAt < busy.endsAt && endsAt > busy.startsAt);
        if (!overlaps) slots.push({ startsAt, endsAt });
      }
      const next = addLocalMinutes(cursor, step);
      if (!next) break;
      cursor = next;
    }
  }
  return slots;
}

