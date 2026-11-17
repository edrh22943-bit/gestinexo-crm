/** E.164: + then country code and subscriber number (8–15 digits total after +). */
const E164_RE = /^\+[1-9]\d{7,14}$/;

export function isValidPhoneE164(value: string): boolean {
  return E164_RE.test(value);
}

/**
 * Normalizes optional phone input. Empty → null.
 * Non-empty must already be E.164 (no silent reformatting beyond trim).
 */
export function normalizePhoneE164(
  value: string | null | undefined,
): { ok: true; phone: string | null } | { ok: false; error: string } {
  const trimmed = (value ?? "").trim();
  if (!trimmed) {
    return { ok: true, phone: null };
  }
  if (!isValidPhoneE164(trimmed)) {
    return {
      ok: false,
      error: "El teléfono debe estar en formato E.164 (ej. +51987654321)",
    };
  }
  return { ok: true, phone: trimmed };
}
