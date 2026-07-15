import { z } from "zod";
import { getPublicSupabaseConfig } from "@/lib/supabase/config";

const serverSchema = z.object({
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1).optional(),
});

export function getServerEnv() {
  return {
    ...getPublicSupabaseConfig(),
    ...serverSchema.parse(process.env),
  };
}
