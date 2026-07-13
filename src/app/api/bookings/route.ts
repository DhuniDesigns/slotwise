import { NextResponse } from "next/server";
import { bookingSchema } from "@/lib/validation";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const parsed = bookingSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid booking details", details: parsed.error.flatten() }, { status: 400 });
  try {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase.rpc("create_booking", {
      p_host_slug: parsed.data.hostSlug,
      p_appointment_type_id: parsed.data.appointmentTypeId,
      p_starts_at: parsed.data.startsAt,
      p_invitee_name: parsed.data.inviteeName,
      p_invitee_email: parsed.data.inviteeEmail,
      p_invitee_note: parsed.data.inviteeNote ?? null,
      p_invitee_timezone: parsed.data.inviteeTimezone,
    });
    if (error) {
      const conflict = error.code === "23P01" || error.message.includes("slot_unavailable");
      return NextResponse.json({ error: conflict ? "Slot no longer available" : "Booking failed" }, { status: conflict ? 409 : 500 });
    }
    return NextResponse.json({ appointmentId: data }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Booking service is not configured" }, { status: 503 });
  }
}

