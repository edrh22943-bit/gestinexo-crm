/** Shared multi-tenant identifiers (TypeScript camelCase). */
export type OrganizationId = string;
export type BusinessId = string;

export type TenantIds = {
  organizationId: OrganizationId;
  businessId: BusinessId;
};
