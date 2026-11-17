import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { TenantMemoryStore } from "./memory-store";
import {
  canAccessBusinessRow,
  isBusinessMember,
  isOrgMember,
  type Membership,
} from "./policy";

const ORG_A = "org_a";
const ORG_B = "org_b";
const BIZ_A = "biz_a";
const BIZ_B = "biz_b";
const USER_A = "auth_user_a";
const USER_B = "auth_user_b";

const memberships: Membership[] = [
  { authUserId: USER_A, organizationId: ORG_A, businessId: BIZ_A },
  { authUserId: USER_B, organizationId: ORG_B, businessId: BIZ_B },
];

describe("RLS policy helpers (mirror SQL is_business_member)", () => {
  it("allows member of business A", () => {
    expect(isBusinessMember(memberships, USER_A, ORG_A, BIZ_A)).toBe(true);
  });

  it("denies user A access to business B", () => {
    expect(isBusinessMember(memberships, USER_A, ORG_B, BIZ_B)).toBe(false);
  });

  it("denies cross-org even with guessed ids", () => {
    expect(isOrgMember(memberships, USER_A, ORG_B)).toBe(false);
    expect(
      canAccessBusinessRow(memberships, USER_A, {
        organization_id: ORG_B,
        business_id: BIZ_B,
      }),
    ).toBe(false);
  });
});

describe("multi-tenant isolation: Negocio A ↛ Negocio B", () => {
  function seedStore(): TenantMemoryStore {
    const store = new TenantMemoryStore();
    store.seedMembership(memberships[0]!);
    store.seedMembership(memberships[1]!);

    store.seedContactAsAdmin({
      id: "contact_a",
      organization_id: ORG_A,
      business_id: BIZ_A,
      name: "Cliente A",
      phone_e164: "+51911111111",
    });
    store.seedContactAsAdmin({
      id: "contact_b",
      organization_id: ORG_B,
      business_id: BIZ_B,
      name: "Cliente B",
      phone_e164: "+51922222222",
    });
    store.seedLeadAsAdmin({
      id: "lead_b",
      organization_id: ORG_B,
      business_id: BIZ_B,
      contact_id: "contact_b",
      title: "Oportunidad B",
    });
    return store;
  }

  it("user A can only list contacts of business A", () => {
    const store = seedStore();
    const rows = store.listContacts(USER_A);
    expect(rows).toHaveLength(1);
    expect(rows[0]?.id).toBe("contact_a");
  });

  it("user A cannot read contact of business B", () => {
    const store = seedStore();
    expect(store.getContact(USER_A, "contact_b")).toBeNull();
  });

  it("user A cannot insert into business B", () => {
    const store = seedStore();
    const result = store.insertContact(USER_A, {
      id: "contact_intrusion",
      organization_id: ORG_B,
      business_id: BIZ_B,
      name: "Intruso",
      phone_e164: "+51999999999",
    });
    expect(result).toEqual({ ok: false, reason: "rls_denied" });
    expect(store.listContacts(USER_B).map((c) => c.id)).toEqual(["contact_b"]);
  });

  it("user A cannot update contact of business B", () => {
    const store = seedStore();
    const result = store.updateContact(USER_A, "contact_b", {
      name: "Hackeado",
    });
    expect(result).toEqual({ ok: false, reason: "rls_denied" });
    expect(store.getContact(USER_B, "contact_b")?.name).toBe("Cliente B");
  });

  it("user A cannot delete contact of business B", () => {
    const store = seedStore();
    const result = store.deleteContact(USER_A, "contact_b");
    expect(result).toEqual({ ok: false, reason: "rls_denied" });
    expect(store.getContact(USER_B, "contact_b")).not.toBeNull();
  });

  it("user A cannot read, update, or delete leads of business B", () => {
    const store = seedStore();
    expect(store.listLeads(USER_A)).toEqual([]);
    expect(store.updateLead(USER_A, "lead_b", { title: "x" })).toEqual({
      ok: false,
      reason: "rls_denied",
    });
    expect(store.deleteLead(USER_A, "lead_b")).toEqual({
      ok: false,
      reason: "rls_denied",
    });
    expect(store.listLeads(USER_B)).toHaveLength(1);
  });

  it("user A cannot insert a lead into business B", () => {
    const store = seedStore();
    expect(
      store.insertLead(USER_A, {
        id: "lead_intrusion",
        organization_id: ORG_B,
        business_id: BIZ_B,
        contact_id: "contact_b",
        title: "Intrusión",
      }),
    ).toEqual({ ok: false, reason: "rls_denied" });
  });
});

describe("SQL migration RLS coverage", () => {
  const migrationPath = path.resolve(
    __dirname,
    "../../../supabase/migrations/20261117050000_phase1_core_schema.sql",
  );
  const sql = readFileSync(migrationPath, "utf8");

  const businessTables = [
    "contacts",
    "pipelines",
    "pipeline_stages",
    "leads",
    "users",
  ] as const;

  it("creates required core tables", () => {
    for (const table of [
      "organizations",
      "businesses",
      "users",
      "contacts",
      "pipelines",
      "pipeline_stages",
      "leads",
    ]) {
      expect(sql).toMatch(new RegExp(`create table public\\.${table}\\b`, "i"));
    }
  });

  it("enables RLS on every business-data table", () => {
    for (const table of [
      "organizations",
      "businesses",
      ...businessTables,
    ]) {
      expect(sql).toMatch(
        new RegExp(
          `alter table public\\.${table} enable row level security`,
          "i",
        ),
      );
    }
  });

  it("defines is_business_member helper and member policies", () => {
    expect(sql).toMatch(/is_business_member/i);
    for (const table of ["contacts", "leads", "pipelines"]) {
      expect(sql).toMatch(
        new RegExp(`${table}_select_member`, "i"),
      );
      expect(sql).toMatch(
        new RegExp(`${table}_update_member`, "i"),
      );
      expect(sql).toMatch(
        new RegExp(`${table}_delete_member`, "i"),
      );
    }
  });

  it("requires organization_id + business_id on business-data tables", () => {
    for (const table of businessTables) {
      const block = sql.split(new RegExp(`create table public\\.${table}`))[1];
      expect(block).toBeTruthy();
      const untilNext = block!.split(/create table public\./)[0]!;
      expect(untilNext).toMatch(/organization_id uuid not null/i);
      expect(untilNext).toMatch(/business_id uuid not null/i);
    }
  });
});
