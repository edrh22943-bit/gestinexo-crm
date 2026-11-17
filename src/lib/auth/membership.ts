import "server-only";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { assertTenantScope, type TenantScope } from "@/lib/tenant/scope";
import { requireAuthUser } from "./session";
import type { UserRole } from "@/types/database";

export type ActiveMembership = TenantScope & {
  membershipId: string;
  authUserId: string;
  role: UserRole;
  fullName: string | null;
  email: string | null;
  organizationName: string | null;
  businessName: string | null;
};

/**
 * Loads the caller's first business membership (MVP: one active business).
 * Tenant ids always come from the `users` row — never from the client.
 */
export async function getActiveMembership(): Promise<ActiveMembership | null> {
  const user = await requireAuthUser();
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("users")
    .select(
      "id, auth_user_id, organization_id, business_id, role, full_name, email",
    )
    .eq("auth_user_id", user.id)
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (error || !data) {
    return null;
  }

  const scope = assertTenantScope({
    organizationId: data.organization_id,
    businessId: data.business_id,
  });

  const [{ data: organization }, { data: business }] = await Promise.all([
    supabase
      .from("organizations")
      .select("name")
      .eq("id", scope.organizationId)
      .maybeSingle(),
    supabase
      .from("businesses")
      .select("name")
      .eq("id", scope.businessId)
      .maybeSingle(),
  ]);

  return {
    membershipId: data.id,
    authUserId: data.auth_user_id,
    role: data.role,
    fullName: data.full_name,
    email: data.email,
    organizationName: organization?.name ?? null,
    businessName: business?.name ?? null,
    ...scope,
  };
}

export async function requireActiveMembership(): Promise<ActiveMembership> {
  const membership = await getActiveMembership();
  if (!membership) {
    redirect("/register?reason=no_membership");
  }
  return membership;
}
