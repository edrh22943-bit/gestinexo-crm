import { ContactCreateForm } from "@/components/contacts/contact-create-form";
import { ContactRow } from "@/components/contacts/contact-row";
import { requireActiveMembership } from "@/lib/auth/membership";
import { createClient } from "@/lib/supabase/server";
import { toTenantFilter } from "@/lib/tenant/scope";

export const instant = false;

export default async function ContactsPage() {
  const membership = await requireActiveMembership();
  const filter = toTenantFilter(membership);
  const supabase = await createClient();

  const { data: contacts, error } = await supabase
    .from("contacts")
    .select("*")
    .eq("organization_id", filter.organization_id)
    .eq("business_id", filter.business_id)
    .order("created_at", { ascending: false });

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Contactos</h1>
        <p className="mt-1 text-sm text-slate-600">
          CRUD filtrado por organizationId + businessId (RLS + helpers).
        </p>
      </div>

      <ContactCreateForm />

      {error ? (
        <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
          {error.message}
        </p>
      ) : null}

      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
        <table className="min-w-full text-left">
          <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-3 py-3 font-medium">Nombre</th>
              <th className="px-3 py-3 font-medium">Teléfono</th>
              <th className="px-3 py-3 font-medium">Email</th>
              <th className="px-3 py-3 font-medium text-right">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {(contacts ?? []).length === 0 ? (
              <tr>
                <td
                  colSpan={4}
                  className="px-3 py-8 text-center text-sm text-slate-500"
                >
                  No hay contactos todavía.
                </td>
              </tr>
            ) : (
              (contacts ?? []).map((contact) => (
                <ContactRow key={contact.id} contact={contact} />
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
