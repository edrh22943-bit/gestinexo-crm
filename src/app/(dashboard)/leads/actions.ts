"use server";

import { revalidatePath } from "next/cache";
import { requireActiveMembership } from "@/lib/auth/membership";
import { buildLeadInsert, buildLeadUpdate } from "@/lib/leads/payload";
import { createClient } from "@/lib/supabase/server";
import { toTenantFilter } from "@/lib/tenant/scope";

export type LeadActionState = {
  error?: string;
  success?: string;
};

export async function createLeadAction(
  _prev: LeadActionState,
  formData: FormData,
): Promise<LeadActionState> {
  const membership = await requireActiveMembership();
  const built = buildLeadInsert(membership, {
    title: String(formData.get("title") ?? ""),
    contactId: String(formData.get("contactId") ?? ""),
    pipelineId: String(formData.get("pipelineId") ?? ""),
    stageId: String(formData.get("stageId") ?? ""),
    amount: String(formData.get("amount") ?? ""),
  });
  if (!built.ok) {
    return { error: built.error };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("leads").insert(built.payload);
  if (error) {
    return { error: error.message };
  }

  revalidatePath("/leads");
  revalidatePath("/dashboard");
  return { success: "Oportunidad creada" };
}

export async function updateLeadAction(
  _prev: LeadActionState,
  formData: FormData,
): Promise<LeadActionState> {
  const membership = await requireActiveMembership();
  const id = String(formData.get("id") ?? "");
  if (!id) {
    return { error: "Oportunidad no válida" };
  }

  const built = buildLeadUpdate({
    title: String(formData.get("title") ?? ""),
    contactId: String(formData.get("contactId") ?? ""),
    pipelineId: String(formData.get("pipelineId") ?? ""),
    stageId: String(formData.get("stageId") ?? ""),
    amount: String(formData.get("amount") ?? ""),
  });
  if (!built.ok) {
    return { error: built.error };
  }

  const filter = toTenantFilter(membership);
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("leads")
    .update(built.payload)
    .eq("id", id)
    .eq("organization_id", filter.organization_id)
    .eq("business_id", filter.business_id)
    .select("id");

  if (error) {
    return { error: error.message };
  }
  if (!data?.length) {
    return { error: "Oportunidad no encontrada o sin permiso" };
  }

  revalidatePath("/leads");
  revalidatePath("/dashboard");
  return { success: "Oportunidad actualizada" };
}

export async function deleteLeadAction(formData: FormData): Promise<void> {
  const membership = await requireActiveMembership();
  const id = String(formData.get("id") ?? "");
  if (!id) {
    return;
  }

  const filter = toTenantFilter(membership);
  const supabase = await createClient();
  await supabase
    .from("leads")
    .delete()
    .eq("id", id)
    .eq("organization_id", filter.organization_id)
    .eq("business_id", filter.business_id)
    .select("id");

  revalidatePath("/leads");
  revalidatePath("/dashboard");
}
