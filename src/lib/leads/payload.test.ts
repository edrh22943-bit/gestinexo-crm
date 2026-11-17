import { describe, expect, it } from "vitest";
import { buildLeadInsert, buildLeadUpdate } from "./payload";

const scopeA = { organizationId: "org_a", businessId: "biz_a" };

describe("buildLeadInsert (tenant isolation)", () => {
  it("stamps tenant ids from membership, not from the client", () => {
    const result = buildLeadInsert(scopeA, {
      title: "Deal",
      contactId: "c1",
      pipelineId: "p1",
      stageId: "s1",
      amount: "100.5",
    });

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.payload.organization_id).toBe("org_a");
    expect(result.payload.business_id).toBe("biz_a");
    expect(result.payload.amount).toBe(100.5);
  });

  it("cannot build an insert for another business without that scope", () => {
    expect(() =>
      buildLeadInsert(
        { organizationId: "", businessId: "biz_b" },
        {
          title: "Intrusión",
          contactId: "c1",
          pipelineId: "p1",
          stageId: "s1",
        },
      ),
    ).toThrow(/organizationId and businessId/);
  });
});

describe("buildLeadUpdate", () => {
  it("omits tenant columns so updates cannot move rows across tenants", () => {
    const result = buildLeadUpdate({
      title: "Deal",
      contactId: "c1",
      pipelineId: "p1",
      stageId: "s1",
      amount: null,
    });
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.payload).not.toHaveProperty("organization_id");
    expect(result.payload).not.toHaveProperty("business_id");
  });
});
