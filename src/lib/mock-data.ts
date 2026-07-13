export type AppointmentStatus = "confirmed" | "cancelled";
export type Appointment = {
  id: string;
  title: string;
  typeId: string;
  guest: string;
  email: string;
  date: string;
  time: string;
  duration: number;
  status: AppointmentStatus;
  note: string;
  location: string;
};

export type AppointmentType = {
  id: string;
  name: string;
  description: string;
  duration: number;
  location: string;
  active: boolean;
  color: string;
};

export const initialAppointmentTypes: AppointmentType[] = [
  { id: "brand", name: "Brand consultation", description: "Clarify your positioning and leave with focused next steps.", duration: 30, location: "Google Meet", active: true, color: "#171717" },
  { id: "portfolio", name: "Portfolio review", description: "Detailed, practical feedback on your creative portfolio.", duration: 60, location: "Zoom", active: true, color: "#525252" },
  { id: "discovery", name: "Discovery call", description: "A quick introduction to see whether we are a good fit.", duration: 20, location: "Phone call", active: true, color: "#A3A3A3" },
];

export const initialAppointments: Appointment[] = [
  { id: "apt-1", title: "Brand consultation", typeId: "brand", guest: "Amara Kalu", email: "amara@example.com", date: "2026-07-07", time: "10:00", duration: 30, status: "confirmed", note: "I’m launching a sustainable skincare studio this autumn.", location: "Google Meet" },
  { id: "apt-2", title: "Portfolio review", typeId: "portfolio", guest: "Noah Johnson", email: "noah@example.com", date: "2026-07-08", time: "14:30", duration: 60, status: "confirmed", note: "Focusing on product design case studies.", location: "Zoom" },
  { id: "apt-3", title: "Discovery call", typeId: "discovery", guest: "Ife Adeyemi", email: "ife@example.com", date: "2026-07-10", time: "09:00", duration: 20, status: "confirmed", note: "Referred by Nnenna.", location: "Phone call" },
  { id: "apt-4", title: "Brand consultation", typeId: "brand", guest: "Lena Ortiz", email: "lena@example.com", date: "2026-07-13", time: "11:30", duration: 30, status: "confirmed", note: "Refresh for an established architecture practice.", location: "Google Meet" },
  { id: "apt-5", title: "Portfolio review", typeId: "portfolio", guest: "Tariq Bello", email: "tariq@example.com", date: "2026-07-15", time: "15:00", duration: 60, status: "confirmed", note: "First senior-level job search.", location: "Zoom" },
];

export const weekDates = [
  { iso: "2026-07-07", short: "Tue", day: 7 },
  { iso: "2026-07-08", short: "Wed", day: 8 },
  { iso: "2026-07-09", short: "Thu", day: 9 },
  { iso: "2026-07-10", short: "Fri", day: 10 },
  { iso: "2026-07-11", short: "Sat", day: 11 },
  { iso: "2026-07-12", short: "Sun", day: 12 },
  { iso: "2026-07-13", short: "Mon", day: 13 },
  { iso: "2026-07-14", short: "Tue", day: 14 },
  { iso: "2026-07-15", short: "Wed", day: 15 },
];

export const availableTimes = ["09:00", "09:30", "10:30", "11:30", "13:00", "14:30", "15:00", "16:00"];
