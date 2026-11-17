import { LeadCreateForm } from "@/components/leads/lead-create-form";
import { LeadRow } from "@/components/leads/lead-row";
import { requireActiveMembership } from "@/lib/auth/membership";
import { createClient } from "@/lib/supabase/server";
import { toTenantFilter } from "@/lib/tenant/scope";

export const instant = false;

export default async function LeadsPage() {
  const membership = await requireActiveMembership();
  const filter = toTenantFilter(membership);
  const supabase = await createClient();

  const [leadsResult, contactsResult, pipelinesResult, stagesResult] =
    await Promise.all([
      supabase
        .from("leads")
        .select("*")
        .eq("organization_id", filter.organization_id)
        .eq("business_id", filter.business_id)
        .order("created_at", { ascending: false }),
      supabase
        .from("contacts")
        .select("id, name")
        .eq("organization_id", filter.organization_id)
        .eq("business_id", filter.business_id)
        .order("name", { ascending: true }),
      supabase
        .from("pipelines")
        .select("id, name")
        .eq("organization_id", filter.organization_id)
        .eq("business_id", filter.business_id)
        .order("created_at", { ascending: true })
        .limit(1),
      supabase
        .from("pipeline_stages")
        .select("id, name, pipeline_id, position")
        .eq("organization_id", filter.organization_id)
        .eq("business_id", filter.business_id)
        .order("position", { ascending: true }),
    ]);

  const pipelineId = pipelinesResult.data?.[0]?.id ?? "";
  const stages = (stagesResult.data ?? [])
    .filter((s) => !pipelineId || s.pipeline_id === pipelineId)
    .map((s) => ({ id: s.id, label: s.name }));
  const contacts = (contactsResult.data ?? []).map((c) => ({
    id: c.id,
    label: c.name,
  }));
  const contactNameById = new Map(
    (contactsResult.data ?? []).map((c) => [c.id, c.name]),
  );
  const stageNameById = new Map(
    (stagesResult.data ?? []).map((s) => [s.id, s.name]),
  );

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Oportunidades</h1>
        <p className="mt-1 text-sm text-slate-600">
          Leads vinculados a contactos y etapas del embudo del negocio.
        </p>
      </div>

      <LeadCreateForm
        contacts={contacts}
        stages={stages}
        pipelineId={pipelineId}
      />

      {leadsResult.error ? (
        <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
          {leadsResult.error.message}
        </p>
      ) : null}

      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
        <table className="min-w-full text-left">
          <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-3 py-3 font-medium">Título</th>
              <th className="px-3 py-3 font-medium">Contacto</th>
              <th className="px-3 py-3 font-medium">Etapa</th>
              <th className="px-3 py-3 font-medium">Monto</th>
              <th className="px-3 py-3 font-medium text-right">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {(leadsResult.data ?? []).length === 0 ? (
              <tr>
                <td
                  colSpan={5}
                  className="px-3 py-8 text-center text-sm text-slate-500"
                >
                  No hay oportunidades todavía.
                </td>
              </tr>
            ) : (
              (leadsResult.data ?? []).map((lead) => (
                <LeadRow
                  key={lead.id}
                  lead={lead}
                  contacts={contacts}
                  stages={stages}
                  pipelineId={lead.pipeline_id || pipelineId}
                  contactName={
                    contactNameById.get(lead.contact_id) ?? lead.contact_id
                  }
                  stageName={stageNameById.get(lead.stage_id) ?? lead.stage_id}
                />
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
