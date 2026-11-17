import {
  canAccessBusinessRow,
  isBusinessMember,
  type Membership,
} from "./policy";

export type ContactRecord = {
  id: string;
  organization_id: string;
  business_id: string;
  name: string;
  phone_e164: string | null;
};

export type LeadRecord = {
  id: string;
  organization_id: string;
  business_id: string;
  contact_id: string;
  title: string;
};

/**
 * In-memory store that applies the same membership gate as Postgres RLS.
 * Demonstrates Negocio A cannot read/modify Negocio B.
 */
export class TenantMemoryStore {
  private memberships: Membership[] = [];
  private contacts = new Map<string, ContactRecord>();
  private leads = new Map<string, LeadRecord>();

  seedMembership(membership: Membership): void {
    this.memberships.push(membership);
  }

  listContacts(authUserId: string): ContactRecord[] {
    return [...this.contacts.values()].filter((row) =>
      canAccessBusinessRow(this.memberships, authUserId, row),
    );
  }

  getContact(authUserId: string, id: string): ContactRecord | null {
    const row = this.contacts.get(id);
    if (!row) return null;
    return canAccessBusinessRow(this.memberships, authUserId, row) ? row : null;
  }

  insertContact(
    authUserId: string,
    row: ContactRecord,
  ): { ok: true; row: ContactRecord } | { ok: false; reason: "rls_denied" } {
    if (!canAccessBusinessRow(this.memberships, authUserId, row)) {
      return { ok: false, reason: "rls_denied" };
    }
    this.contacts.set(row.id, row);
    return { ok: true, row };
  }

  updateContact(
    authUserId: string,
    id: string,
    patch: Partial<Pick<ContactRecord, "name" | "phone_e164">>,
  ): { ok: true; row: ContactRecord } | { ok: false; reason: "rls_denied" | "not_found" } {
    const existing = this.contacts.get(id);
    if (!existing) return { ok: false, reason: "not_found" };
    if (!canAccessBusinessRow(this.memberships, authUserId, existing)) {
      return { ok: false, reason: "rls_denied" };
    }
    const next = { ...existing, ...patch };
    if (!canAccessBusinessRow(this.memberships, authUserId, next)) {
      return { ok: false, reason: "rls_denied" };
    }
    this.contacts.set(id, next);
    return { ok: true, row: next };
  }

  deleteContact(
    authUserId: string,
    id: string,
  ): { ok: true } | { ok: false; reason: "rls_denied" | "not_found" } {
    const existing = this.contacts.get(id);
    if (!existing) return { ok: false, reason: "not_found" };
    if (!canAccessBusinessRow(this.memberships, authUserId, existing)) {
      return { ok: false, reason: "rls_denied" };
    }
    this.contacts.delete(id);
    return { ok: true };
  }

  listLeads(authUserId: string): LeadRecord[] {
    return [...this.leads.values()].filter((row) =>
      canAccessBusinessRow(this.memberships, authUserId, row),
    );
  }

  insertLead(
    authUserId: string,
    row: LeadRecord,
  ): { ok: true; row: LeadRecord } | { ok: false; reason: "rls_denied" } {
    if (!canAccessBusinessRow(this.memberships, authUserId, row)) {
      return { ok: false, reason: "rls_denied" };
    }
    this.leads.set(row.id, row);
    return { ok: true, row };
  }

  updateLead(
    authUserId: string,
    id: string,
    patch: Partial<Pick<LeadRecord, "title">>,
  ): { ok: true; row: LeadRecord } | { ok: false; reason: "rls_denied" | "not_found" } {
    const existing = this.leads.get(id);
    if (!existing) return { ok: false, reason: "not_found" };
    if (!canAccessBusinessRow(this.memberships, authUserId, existing)) {
      return { ok: false, reason: "rls_denied" };
    }
    const next = { ...existing, ...patch };
    this.leads.set(id, next);
    return { ok: true, row: next };
  }

  deleteLead(
    authUserId: string,
    id: string,
  ): { ok: true } | { ok: false; reason: "rls_denied" | "not_found" } {
    const existing = this.leads.get(id);
    if (!existing) return { ok: false, reason: "not_found" };
    if (!canAccessBusinessRow(this.memberships, authUserId, existing)) {
      return { ok: false, reason: "rls_denied" };
    }
    this.leads.delete(id);
    return { ok: true };
  }

  /** Seed without RLS (simulates service-role / migration seed). */
  seedContactAsAdmin(row: ContactRecord): void {
    this.contacts.set(row.id, row);
  }

  seedLeadAsAdmin(row: LeadRecord): void {
    this.leads.set(row.id, row);
  }

  isMember(
    authUserId: string,
    organizationId: string,
    businessId: string,
  ): boolean {
    return isBusinessMember(
      this.memberships,
      authUserId,
      organizationId,
      businessId,
    );
  }
}
