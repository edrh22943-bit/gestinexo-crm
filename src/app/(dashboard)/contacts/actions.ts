"use server";

import { revalidatePath } from "next/cache";
import { requireActiveMembership } from "@/lib/auth/membership";
import {
  buildContactInsert,
  buildContactUpdate,
} from "@/lib/contacts/payload";
import { createClient } from "@/lib/supabase/server";
import { toTenantFilter } from "@/lib/tenant/scope";

export type ContactActionState = {
  error?: string;
  success?: string;
};

export async function createContactAction(
  _prev: ContactActionState,
  formData: FormData,
): Promise<ContactActionState> {
  const membership = await requireActiveMembership();
  const built = buildContactInsert(membership, {
    name: String(formData.get("name") ?? ""),
    phoneE164: String(formData.get("phoneE164") ?? ""),
    email: String(formData.get("email") ?? ""),
  });
  if (!built.ok) {
    return { error: built.error };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("contacts").insert(built.payload);
  if (error) {
    return { error: error.message };
  }

  revalidatePath("/contacts");
  revalidatePath("/dashboard");
  return { success: "Contacto creado" };
}

export async function updateContactAction(
  _prev: ContactActionState,
  formData: FormData,
): Promise<ContactActionState> {
  const membership = await requireActiveMembership();
  const id = String(formData.get("id") ?? "");
  if (!id) {
    return { error: "Contacto no válido" };
  }

  const built = buildContactUpdate({
    name: String(formData.get("name") ?? ""),
    phoneE164: String(formData.get("phoneE164") ?? ""),
    email: String(formData.get("email") ?? ""),
  });
  if (!built.ok) {
    return { error: built.error };
  }

  const filter = toTenantFilter(membership);
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("contacts")
    .update(built.payload)
    .eq("id", id)
    .eq("organization_id", filter.organization_id)
    .eq("business_id", filter.business_id)
    .select("id");

  if (error) {
    return { error: error.message };
  }
  if (!data?.length) {
    return { error: "Contacto no encontrado o sin permiso" };
  }

  revalidatePath("/contacts");
  revalidatePath("/dashboard");
  return { success: "Contacto actualizado" };
}

export async function deleteContactAction(formData: FormData): Promise<void> {
  const membership = await requireActiveMembership();
  const id = String(formData.get("id") ?? "");
  if (!id) {
    return;
  }

  const filter = toTenantFilter(membership);
  const supabase = await createClient();
  await supabase
    .from("contacts")
    .delete()
    .eq("id", id)
    .eq("organization_id", filter.organization_id)
    .eq("business_id", filter.business_id)
    .select("id");

  revalidatePath("/contacts");
  revalidatePath("/dashboard");
  revalidatePath("/leads");
}
