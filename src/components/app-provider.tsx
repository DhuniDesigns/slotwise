"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { initialAppointments, initialAppointmentTypes, type Appointment, type AppointmentType } from "@/lib/mock-data";

type Store = {
  appointments: Appointment[];
  appointmentTypes: AppointmentType[];
  addAppointment: (appointment: Appointment) => void;
  cancelAppointment: (id: string) => void;
  rescheduleAppointment: (id: string, date: string, time: string) => void;
  saveAppointmentType: (type: AppointmentType) => void;
  deleteAppointmentType: (id: string) => void;
  resetDemo: () => void;
};

const StoreContext = createContext<Store | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [appointments, setAppointments] = useState(initialAppointments);
  const [appointmentTypes, setAppointmentTypes] = useState(initialAppointmentTypes);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      try {
        const saved = localStorage.getItem("slotwise-demo");
        if (saved) {
          const parsed = JSON.parse(saved) as { appointments: Appointment[]; appointmentTypes: AppointmentType[] };
          setAppointments(parsed.appointments);
          setAppointmentTypes(parsed.appointmentTypes);
        }
      } catch { /* Keep seeded demo data. */ }
      setHydrated(true);
    }, 0);
    return () => window.clearTimeout(timeout);
  }, []);

  useEffect(() => {
    if (hydrated) localStorage.setItem("slotwise-demo", JSON.stringify({ appointments, appointmentTypes }));
  }, [appointments, appointmentTypes, hydrated]);

  const value = useMemo<Store>(() => ({
    appointments,
    appointmentTypes,
    addAppointment: (appointment) => setAppointments((items) => [appointment, ...items]),
    cancelAppointment: (id) => setAppointments((items) => items.map((item) => item.id === id ? { ...item, status: "cancelled" } : item)),
    rescheduleAppointment: (id, date, time) => setAppointments((items) => items.map((item) => item.id === id ? { ...item, date, time, status: "confirmed" } : item)),
    saveAppointmentType: (type) => setAppointmentTypes((items) => items.some((item) => item.id === type.id) ? items.map((item) => item.id === type.id ? type : item) : [...items, type]),
    deleteAppointmentType: (id) => setAppointmentTypes((items) => items.filter((item) => item.id !== id)),
    resetDemo: () => { setAppointments(initialAppointments); setAppointmentTypes(initialAppointmentTypes); },
  }), [appointments, appointmentTypes]);

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useAppStore() {
  const value = useContext(StoreContext);
  if (!value) throw new Error("useAppStore must be used inside AppProvider");
  return value;
}
