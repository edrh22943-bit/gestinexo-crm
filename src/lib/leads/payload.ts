import { assertTenantScope, type TenantScope } from "@/lib/tenant/scope";

export type LeadWriteInput = {
  title: string;
  contactId: string;
  pipelineId: string;
  stageId: string;
  amount?: string | number | null;
};

export type LeadInsertPayload = {
  organization_id: string;
  business_id: string;
  contact_id: string;
  pipeline_id: string;
  stage_id: string;
  title: string;
  amount: number | null;
};

export type LeadUpdatePayload = {
  title: string;
  contact_id: string;
  pipeline_id: string;
  stage_id: string;
  amount: number | null;
};

function parseAmount(
  value: string | number | null | undefined,
): { ok: true; amount: number | null } | { ok: false; error: string } {
  if (value === null || value === undefined || value === "") {
    return { ok: true, amount: null };
  }
  const n = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(n) || n < 0) {
    return { ok: false, error: "El monto debe ser un número ≥ 0" };
  }
  return { ok: true, amount: Math.round(n * 100) / 100 };
}

/**
 * Builds a lead insert using tenant ids from membership only.
 */
export function buildLeadInsert(
  scope: TenantScope,
  input: LeadWriteInput,
): { ok: true; payload: LeadInsertPayload } | { ok: false; error: string } {
  const tenant = assertTenantScope(scope);
  const title = input.title.trim();
  if (!title) {
    return { ok: false, error: "El título es obligatorio" };
  }
  if (!input.contactId || !input.pipelineId || !input.stageId) {
    return {
      ok: false,
      error: "Contacto, embudo y etapa son obligatorios",
    };
  }

  const amount = parseAmount(input.amount);
  if (!amount.ok) {
    return amount;
  }

  return {
    ok: true,
    payload: {
      organization_id: tenant.organizationId,
      business_id: tenant.businessId,
      contact_id: input.contactId,
      pipeline_id: input.pipelineId,
      stage_id: input.stageId,
      title,
      amount: amount.amount,
    },
  };
}

export function buildLeadUpdate(
  input: LeadWriteInput,
): { ok: true; payload: LeadUpdatePayload } | { ok: false; error: string } {
  const title = input.title.trim();
  if (!title) {
    return { ok: false, error: "El título es obligatorio" };
  }
  if (!input.contactId || !input.pipelineId || !input.stageId) {
    return {
      ok: false,
      error: "Contacto, embudo y etapa son obligatorios",
    };
  }

  const amount = parseAmount(input.amount);
  if (!amount.ok) {
    return amount;
  }

  return {
    ok: true,
    payload: {
      title,
      contact_id: input.contactId,
      pipeline_id: input.pipelineId,
      stage_id: input.stageId,
      amount: amount.amount,
    },
  };
}
