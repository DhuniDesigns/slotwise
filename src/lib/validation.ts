import { z } from "zod";

export const bookingSchema = z.object({
  hostSlug: z.string().trim().min(3).max(48).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  appointmentTypeId: z.string().uuid(),
  startsAt: z.iso.datetime({ offset: true }),
  inviteeName: z.string().trim().min(2).max(100),
  inviteeEmail: z.email().max(254),
  inviteeNote: z.string().trim().max(2000).optional(),
  inviteeTimezone: z.string().min(1).max(100).refine((value) => {
    try { Intl.DateTimeFormat(undefined, { timeZone: value }); return true; } catch { return false; }
  }, "Invalid IANA timezone"),
});

export const cancellationSchema = z.object({ reason: z.string().trim().min(3).max(500) });

