import { assertTenantScope, type TenantScope } from "@/lib/tenant/scope";
import { normalizePhoneE164 } from "@/lib/phone";

export type ContactWriteInput = {
  name: string;
  phoneE164?: string | null;
  email?: string | null;
};

export type ContactInsertPayload = {
  organization_id: string;
  business_id: string;
  name: string;
  phone_e164: string | null;
  email: string | null;
};

export type ContactUpdatePayload = {
  name: string;
  phone_e164: string | null;
  email: string | null;
};

/**
 * Builds a contact insert using tenant ids from membership only.
 * Client-supplied organizationId/businessId are ignored by design.
 */
export function buildContactInsert(
  scope: TenantScope,
  input: ContactWriteInput,
): { ok: true; payload: ContactInsertPayload } | { ok: false; error: string } {
  const tenant = assertTenantScope(scope);
  const name = input.name.trim();
  if (!name) {
    return { ok: false, error: "El nombre es obligatorio" };
  }

  const phone = normalizePhoneE164(input.phoneE164);
  if (!phone.ok) {
    return phone;
  }

  const email = (input.email ?? "").trim() || null;

  return {
    ok: true,
    payload: {
      organization_id: tenant.organizationId,
      business_id: tenant.businessId,
      name,
      phone_e164: phone.phone,
      email,
    },
  };
}

export function buildContactUpdate(
  input: ContactWriteInput,
): { ok: true; payload: ContactUpdatePayload } | { ok: false; error: string } {
  const name = input.name.trim();
  if (!name) {
    return { ok: false, error: "El nombre es obligatorio" };
  }

  const phone = normalizePhoneE164(input.phoneE164);
  if (!phone.ok) {
    return phone;
  }

  const email = (input.email ?? "").trim() || null;

  return {
    ok: true,
    payload: {
      name,
      phone_e164: phone.phone,
      email,
    },
  };
}
