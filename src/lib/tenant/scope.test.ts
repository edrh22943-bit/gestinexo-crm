import { describe, expect, it } from "vitest";
import { assertTenantScope, toTenantFilter } from "./scope";

describe("assertTenantScope", () => {
  it("accepts a complete tenant scope", () => {
    const scope = assertTenantScope({
      organizationId: "org_1",
      businessId: "biz_1",
    });

    expect(scope).toEqual({
      organizationId: "org_1",
      businessId: "biz_1",
    });
  });

  it("rejects missing organizationId (multi-tenant isolation)", () => {
    expect(() =>
      assertTenantScope({ organizationId: "", businessId: "biz_1" }),
    ).toThrow(/organizationId and businessId/);
  });

  it("rejects missing businessId (multi-tenant isolation)", () => {
    expect(() =>
      assertTenantScope({ organizationId: "org_1", businessId: undefined }),
    ).toThrow(/organizationId and businessId/);
  });

  it("rejects null / undefined scope", () => {
    expect(() => assertTenantScope(null)).toThrow(
      /organizationId and businessId/,
    );
    expect(() => assertTenantScope(undefined)).toThrow(
      /organizationId and businessId/,
    );
  });
});

describe("toTenantFilter", () => {
  it("maps camelCase scope to snake_case DB columns", () => {
    expect(
      toTenantFilter({ organizationId: "org_1", businessId: "biz_1" }),
    ).toEqual({
      organization_id: "org_1",
      business_id: "biz_1",
    });
  });
});
