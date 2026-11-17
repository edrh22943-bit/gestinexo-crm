/**
 * Tenant scope required on every business-data query (see .cursor/rules).
 * organization_id + business_id isolation is mandatory for multi-tenant safety.
 */
export type TenantScope = {
  organizationId: string;
  businessId: string;
};

export function assertTenantScope(
  scope: Partial<TenantScope> | null | undefined,
): TenantScope {
  if (!scope?.organizationId || !scope?.businessId) {
    throw new Error(
      "TenantScope requires both organizationId and businessId",
    );
  }

  return {
    organizationId: scope.organizationId,
    businessId: scope.businessId,
  };
}

/**
 * Builds a filter payload for Supabase queries (camelCase in TS → snake_case in DB).
 */
export function toTenantFilter(scope: TenantScope): {
  organization_id: string;
  business_id: string;
} {
  const { organizationId, businessId } = assertTenantScope(scope);
  return {
    organization_id: organizationId,
    business_id: businessId,
  };
}
