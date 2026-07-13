import { NextResponse } from "next/server";
import { cancellationSchema } from "@/lib/validation";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function POST(request:Request,{params}:{params:Promise<{id:string}>}) {
  const { id } = await params;
  const body = cancellationSchema.safeParse(await request.json().catch(()=>null));
  if (!body.success) return NextResponse.json({error:"A cancellation reason is required"},{status:400});
  try {
    const supabase = await createSupabaseServerClient();
    const { data: claims } = await supabase.auth.getClaims();
    if (!claims?.claims.sub) return NextResponse.json({error:"Unauthorized"},{status:401});
    const { error } = await supabase.rpc("cancel_appointment", { p_appointment_id:id, p_reason:body.data.reason });
    if (error) return NextResponse.json({error:"Unable to cancel appointment"},{status:400});
    return NextResponse.json({ok:true});
  } catch { return NextResponse.json({error:"Service is not configured"},{status:503}); }
}

