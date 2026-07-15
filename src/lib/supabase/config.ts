const fallbackPublicSupabaseConfig = {
  NEXT_PUBLIC_SUPABASE_URL: "https://sobovnrtxnanxihzgijc.supabase.co",
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: "sb_publishable_xYh6V9A_cqb4o0wChUXSmQ_MmeEn8t5",
};

function normalizeEnvValue(value: string | undefined) {
  const trimmed = value?.trim();
  if (!trimmed) return undefined;

  const unquoted = trimmed.replace(/^["']|["']$/g, "");
  const assignmentMatch = unquoted.match(/^[A-Z0-9_]+\s*=\s*(.+)$/i);

  return assignmentMatch?.[1]?.trim() || unquoted;
}

function isValidHttpUrl(value: string | undefined): value is string {
  if (!value) return false;

  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

function isValidPublicSupabaseKey(value: string | undefined): value is string {
  if (!value) return false;

  return value.startsWith("sb_publishable_") || value.startsWith("eyJ");
}

export function getPublicSupabaseConfig() {
  const envUrl = normalizeEnvValue(process.env.NEXT_PUBLIC_SUPABASE_URL);
  const envPublishableKey = normalizeEnvValue(process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY);

  return {
    NEXT_PUBLIC_SUPABASE_URL: isValidHttpUrl(envUrl) ? envUrl : fallbackPublicSupabaseConfig.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: isValidPublicSupabaseKey(envPublishableKey)
      ? envPublishableKey
      : fallbackPublicSupabaseConfig.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
  };
}
