"use client";

import { useActionState, useState } from "react";
import {
  deleteContactAction,
  updateContactAction,
  type ContactActionState,
} from "@/app/(dashboard)/contacts/actions";
import type { ContactRow as Contact } from "@/types/database";

const initial: ContactActionState = {};

export function ContactRow({ contact }: { contact: Contact }) {
  const [editing, setEditing] = useState(false);
  const [state, formAction, pending] = useActionState(
    updateContactAction,
    initial,
  );

  if (!editing) {
    return (
      <tr className="border-t border-slate-100">
        <td className="px-3 py-3 text-sm font-medium text-slate-900">
          {contact.name}
        </td>
        <td className="px-3 py-3 text-sm text-slate-600">
          {contact.phone_e164 ?? "—"}
        </td>
        <td className="px-3 py-3 text-sm text-slate-600">
          {contact.email ?? "—"}
        </td>
        <td className="px-3 py-3 text-right">
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setEditing(true)}
              className="rounded-md border border-slate-300 px-2 py-1 text-xs hover:bg-slate-50"
            >
              Editar
            </button>
            <form action={deleteContactAction}>
              <input type="hidden" name="id" value={contact.id} />
              <button
                type="submit"
                className="rounded-md border border-red-200 px-2 py-1 text-xs text-red-700 hover:bg-red-50"
              >
                Eliminar
              </button>
            </form>
          </div>
        </td>
      </tr>
    );
  }

  return (
    <tr className="border-t border-slate-100 bg-teal-50/40">
      <td colSpan={4} className="px-3 py-3">
        <form action={formAction} className="grid gap-2 sm:grid-cols-4">
          <input type="hidden" name="id" value={contact.id} />
          <input
            name="name"
            defaultValue={contact.name}
            required
            className="rounded-md border border-slate-300 px-2 py-1.5 text-sm"
          />
          <input
            name="phoneE164"
            defaultValue={contact.phone_e164 ?? ""}
            placeholder="+51987654321"
            className="rounded-md border border-slate-300 px-2 py-1.5 text-sm"
          />
          <input
            name="email"
            type="email"
            defaultValue={contact.email ?? ""}
            className="rounded-md border border-slate-300 px-2 py-1.5 text-sm"
          />
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={pending}
              className="rounded-md bg-teal-700 px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-60"
            >
              {pending ? "…" : "Guardar"}
            </button>
            <button
              type="button"
              onClick={() => setEditing(false)}
              className="rounded-md border border-slate-300 px-3 py-1.5 text-xs"
            >
              Cancelar
            </button>
          </div>
          {state.error ? (
            <p className="sm:col-span-4 text-sm text-red-700">{state.error}</p>
          ) : null}
          {state.success ? (
            <p className="sm:col-span-4 text-sm text-teal-800">{state.success}</p>
          ) : null}
        </form>
      </td>
    </tr>
  );
}
