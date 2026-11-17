import Link from "next/link";
import { requireActiveMembership } from "@/lib/auth/membership";
import { createClient } from "@/lib/supabase/server";
import { toTenantFilter } from "@/lib/tenant/scope";

export const instant = false;

export default async function DashboardPage() {
  const membership = await requireActiveMembership();
  const supabase = await createClient();
  const filter = toTenantFilter(membership);

  const [contactsResult, leadsResult] = await Promise.all([
    supabase
      .from("contacts")
      .select("id", { count: "exact", head: true })
      .eq("organization_id", filter.organization_id)
      .eq("business_id", filter.business_id),
    supabase
      .from("leads")
      .select("id", { count: "exact", head: true })
      .eq("organization_id", filter.organization_id)
      .eq("business_id", filter.business_id),
  ]);

  const contactCount = contactsResult.count ?? 0;
  const leadCount = leadsResult.count ?? 0;

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Dashboard</h1>
        <p className="mt-1 text-sm text-slate-600">
          Resumen de {membership.businessName ?? "tu negocio"}
          {membership.organizationName
            ? ` · ${membership.organizationName}`
            : ""}
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Link
          href="/contacts"
          className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition hover:border-teal-300"
        >
          <p className="text-sm font-medium text-slate-500">Contactos</p>
          <p className="mt-2 text-3xl font-bold text-teal-900">{contactCount}</p>
        </Link>
        <Link
          href="/leads"
          className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition hover:border-teal-300"
        >
          <p className="text-sm font-medium text-slate-500">Oportunidades</p>
          <p className="mt-2 text-3xl font-bold text-teal-900">{leadCount}</p>
        </Link>
      </div>
    </div>
  );
}
