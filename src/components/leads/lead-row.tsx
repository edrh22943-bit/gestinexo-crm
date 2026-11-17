"use client";

import { useActionState, useState } from "react";
import {
  deleteLeadAction,
  updateLeadAction,
  type LeadActionState,
} from "@/app/(dashboard)/leads/actions";
import type { LeadFormOption } from "./lead-create-form";
import type { LeadRow as Lead } from "@/types/database";

const initial: LeadActionState = {};

export function LeadRow({
  lead,
  contacts,
  stages,
  pipelineId,
  contactName,
  stageName,
}: {
  lead: Lead;
  contacts: LeadFormOption[];
  stages: LeadFormOption[];
  pipelineId: string;
  contactName: string;
  stageName: string;
}) {
  const [editing, setEditing] = useState(false);
  const [state, formAction, pending] = useActionState(updateLeadAction, initial);

  if (!editing) {
    return (
      <tr className="border-t border-slate-100">
        <td className="px-3 py-3 text-sm font-medium text-slate-900">
          {lead.title}
        </td>
        <td className="px-3 py-3 text-sm text-slate-600">{contactName}</td>
        <td className="px-3 py-3 text-sm text-slate-600">{stageName}</td>
        <td className="px-3 py-3 text-sm text-slate-600">
          {lead.amount != null ? lead.amount.toLocaleString("es-PE") : "—"}
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
            <form action={deleteLeadAction}>
              <input type="hidden" name="id" value={lead.id} />
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
      <td colSpan={5} className="px-3 py-3">
        <form action={formAction} className="grid gap-2 sm:grid-cols-5">
          <input type="hidden" name="id" value={lead.id} />
          <input type="hidden" name="pipelineId" value={pipelineId} />
          <input
            name="title"
            defaultValue={lead.title}
            required
            className="rounded-md border border-slate-300 px-2 py-1.5 text-sm"
          />
          <select
            name="contactId"
            defaultValue={lead.contact_id}
            required
            className="rounded-md border border-slate-300 px-2 py-1.5 text-sm"
          >
            {contacts.map((c) => (
              <option key={c.id} value={c.id}>
                {c.label}
              </option>
            ))}
          </select>
          <select
            name="stageId"
            defaultValue={lead.stage_id}
            required
            className="rounded-md border border-slate-300 px-2 py-1.5 text-sm"
          >
            {stages.map((s) => (
              <option key={s.id} value={s.id}>
                {s.label}
              </option>
            ))}
          </select>
          <input
            name="amount"
            type="number"
            min="0"
            step="0.01"
            defaultValue={lead.amount ?? ""}
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
            <p className="sm:col-span-5 text-sm text-red-700">{state.error}</p>
          ) : null}
          {state.success ? (
            <p className="sm:col-span-5 text-sm text-teal-800">{state.success}</p>
          ) : null}
        </form>
      </td>
    </tr>
  );
}
