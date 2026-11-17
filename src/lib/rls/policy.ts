/**
 * Mirrors SQL RLS helpers `is_business_member` / `is_org_member`.
 * Used by in-memory isolation tests so CI can prove A ↛ B without a live DB.
 */

export type Membership = {
  authUserId: string;
  organizationId: string;
  businessId: string;
};

export function isBusinessMember(
  memberships: readonly Membership[],
  authUserId: string,
  organizationId: string,
  businessId: string,
): boolean {
  return memberships.some(
    (m) =>
      m.authUserId === authUserId &&
      m.organizationId === organizationId &&
      m.businessId === businessId,
  );
}

export function isOrgMember(
  memberships: readonly Membership[],
  authUserId: string,
  organizationId: string,
): boolean {
  return memberships.some(
    (m) => m.authUserId === authUserId && m.organizationId === organizationId,
  );
}

export type TenantRow = {
  organization_id: string;
  business_id: string;
};

/** SELECT/UPDATE/DELETE USING + INSERT WITH CHECK for business-data tables. */
export function canAccessBusinessRow(
  memberships: readonly Membership[],
  authUserId: string,
  row: TenantRow,
): boolean {
  return isBusinessMember(
    memberships,
    authUserId,
    row.organization_id,
    row.business_id,
  );
}
