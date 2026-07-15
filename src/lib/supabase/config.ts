const fallbackPublicSupabaseConfig = {
  NEXT_PUBLIC_SUPABASE_URL: "https://sobovnrtxnanxihzgijc.supabase.co",
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: "sb_publishable_xYh6V9A_cqb4o0wChUXSmQ_MmeEn8t5",
};

function isValidHttpUrl(value: string | undefined): value is string {
  if (!value) return false;

  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

export function getPublicSupabaseConfig() {
  const envUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const envPublishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  return {
    NEXT_PUBLIC_SUPABASE_URL: isValidHttpUrl(envUrl) ? envUrl : fallbackPublicSupabaseConfig.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: envPublishableKey?.trim() || fallbackPublicSupabaseConfig.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
  };
}
