import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import { assertTenantScope, type TenantScope } from "@/lib/tenant/scope";

export type BootstrapTenantInput = {
  authUserId: string;
  email: string;
  fullName: string;
  organizationName: string;
  businessName: string;
};

export type BootstrapTenantResult = TenantScope & {
  membershipId: string;
  pipelineId: string;
  defaultStageId: string;
};

const DEFAULT_STAGES = [
  "Nuevo",
  "Contactado",
  "Negociación",
  "Ganado",
  "Perdido",
] as const;

/**
 * Creates org + business + membership + default pipeline/stages for a new user.
 * Uses the service-role client because RLS cannot insert a business before the
 * first membership exists (chicken-and-egg with `is_org_member`).
 * Server-only — never call from the browser.
 */
export async function bootstrapTenantForUser(
  input: BootstrapTenantInput,
): Promise<BootstrapTenantResult> {
  const admin = createAdminClient();

  const { data: organization, error: orgError } = await admin
    .from("organizations")
    .insert({ name: input.organizationName })
    .select("id")
    .single();
  if (orgError || !organization) {
    throw new Error(orgError?.message ?? "No se pudo crear la organización");
  }

  const { data: business, error: bizError } = await admin
    .from("businesses")
    .insert({
      organization_id: organization.id,
      name: input.businessName,
    })
    .select("id")
    .single();
  if (bizError || !business) {
    throw new Error(bizError?.message ?? "No se pudo crear el negocio");
  }

  const scope = assertTenantScope({
    organizationId: organization.id,
    businessId: business.id,
  });

  const { data: membership, error: userError } = await admin
    .from("users")
    .insert({
      auth_user_id: input.authUserId,
      organization_id: scope.organizationId,
      business_id: scope.businessId,
      role: "admin",
      full_name: input.fullName,
      email: input.email,
    })
    .select("id")
    .single();
  if (userError || !membership) {
    throw new Error(userError?.message ?? "No se pudo crear la membresía");
  }

  const { data: pipeline, error: pipelineError } = await admin
    .from("pipelines")
    .insert({
      organization_id: scope.organizationId,
      business_id: scope.businessId,
      name: "Ventas",
    })
    .select("id")
    .single();
  if (pipelineError || !pipeline) {
    throw new Error(pipelineError?.message ?? "No se pudo crear el embudo");
  }

  const stageRows = DEFAULT_STAGES.map((name, position) => ({
    organization_id: scope.organizationId,
    business_id: scope.businessId,
    pipeline_id: pipeline.id,
    name,
    position,
  }));

  const { data: stages, error: stagesError } = await admin
    .from("pipeline_stages")
    .insert(stageRows)
    .select("id, position")
    .order("position", { ascending: true });
  if (stagesError || !stages?.length) {
    throw new Error(stagesError?.message ?? "No se pudieron crear las etapas");
  }

  const defaultStage = stages.find((s) => s.position === 0) ?? stages[0]!;

  return {
    ...scope,
    membershipId: membership.id,
    pipelineId: pipeline.id,
    defaultStageId: defaultStage.id,
  };
}
