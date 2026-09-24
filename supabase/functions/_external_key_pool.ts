/**
 * Merge into your existing stripe/fulfill edge function after payment is verified.
 * Do not import this file from the static GitHub Pages site.
 */

export async function assignExternalLicenseKey(
  supabaseAdmin: { rpc: (fn: string, args: Record<string, string>) => Promise<{ data: unknown; error: unknown }> },
  sessionId: string
): Promise<string | null> {
  if (!sessionId) return null;
  const { data, error } = await supabaseAdmin.rpc("assign_external_license", {
    p_session_id: sessionId,
  });
  if (error) {
    console.error("assign_external_license failed", error);
    return null;
  }
  return typeof data === "string" && data.length > 0 ? data : null;
}
