import { describe, expect, it } from "vitest";
import { buildContactInsert, buildContactUpdate } from "./payload";

const scopeA = { organizationId: "org_a", businessId: "biz_a" };

describe("buildContactInsert (tenant isolation)", () => {
  it("stamps organization_id and business_id from membership scope only", () => {
    const result = buildContactInsert(scopeA, {
      name: "Ana",
      phoneE164: "+51911111111",
      email: "ana@example.com",
    });

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.payload).toEqual({
      organization_id: "org_a",
      business_id: "biz_a",
      name: "Ana",
      phone_e164: "+51911111111",
      email: "ana@example.com",
    });
  });

  it("rejects incomplete tenant scope (multi-tenant rule)", () => {
    expect(() =>
      buildContactInsert(
        { organizationId: "org_a", businessId: "" },
        { name: "X" },
      ),
    ).toThrow(/organizationId and businessId/);
  });

  it("rejects invalid phone", () => {
    const result = buildContactInsert(scopeA, {
      name: "Ana",
      phoneE164: "999",
    });
    expect(result).toMatchObject({ ok: false });
  });
});

describe("buildContactUpdate", () => {
  it("does not include tenant columns (cannot re-home a contact)", () => {
    const result = buildContactUpdate({
      name: "Ana",
      phoneE164: "",
      email: "",
    });
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.payload).toEqual({
      name: "Ana",
      phone_e164: null,
      email: null,
    });
    expect(result.payload).not.toHaveProperty("organization_id");
    expect(result.payload).not.toHaveProperty("business_id");
  });
});
