"use client";

import { useActionState } from "react";
import {
  createLeadAction,
  type LeadActionState,
} from "@/app/(dashboard)/leads/actions";

const initial: LeadActionState = {};

export type LeadFormOption = { id: string; label: string };

export function LeadCreateForm({
  contacts,
  stages,
  pipelineId,
}: {
  contacts: LeadFormOption[];
  stages: LeadFormOption[];
  pipelineId: string;
}) {
  const [state, formAction, pending] = useActionState(createLeadAction, initial);

  if (!pipelineId || contacts.length === 0 || stages.length === 0) {
    return (
      <p className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
        Para crear oportunidades necesitas al menos un contacto y un embudo con
        etapas (se crean al registrarte). Crea un contacto primero.
      </p>
    );
  }

  return (
    <form
      action={formAction}
      className="grid gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:grid-cols-2"
    >
      <h2 className="sm:col-span-2 text-sm font-semibold text-slate-800">
        Nueva oportunidad
      </h2>
      <input type="hidden" name="pipelineId" value={pipelineId} />
      <label className="flex flex-col gap-1 text-sm sm:col-span-2">
        <span className="font-medium text-slate-700">Título</span>
        <input
          name="title"
          required
          className="rounded-md border border-slate-300 px-3 py-2 outline-none ring-teal-600 focus:ring-2"
        />
      </label>
      <label className="flex flex-col gap-1 text-sm">
        <span className="font-medium text-slate-700">Contacto</span>
        <select
          name="contactId"
          required
          className="rounded-md border border-slate-300 px-3 py-2 outline-none ring-teal-600 focus:ring-2"
        >
          {contacts.map((c) => (
            <option key={c.id} value={c.id}>
              {c.label}
            </option>
          ))}
        </select>
      </label>
      <label className="flex flex-col gap-1 text-sm">
        <span className="font-medium text-slate-700">Etapa</span>
        <select
          name="stageId"
          required
          className="rounded-md border border-slate-300 px-3 py-2 outline-none ring-teal-600 focus:ring-2"
        >
          {stages.map((s) => (
            <option key={s.id} value={s.id}>
              {s.label}
            </option>
          ))}
        </select>
      </label>
      <label className="flex flex-col gap-1 text-sm">
        <span className="font-medium text-slate-700">Monto (opcional)</span>
        <input
          name="amount"
          type="number"
          min="0"
          step="0.01"
          className="rounded-md border border-slate-300 px-3 py-2 outline-none ring-teal-600 focus:ring-2"
        />
      </label>
      {state.error ? (
        <p className="sm:col-span-2 text-sm text-red-700" role="alert">
          {state.error}
        </p>
      ) : null}
      {state.success ? (
        <p className="sm:col-span-2 text-sm text-teal-800" role="status">
          {state.success}
        </p>
      ) : null}
      <div className="sm:col-span-2">
        <button
          type="submit"
          disabled={pending}
          className="rounded-md bg-teal-700 px-4 py-2 text-sm font-semibold text-white hover:bg-teal-800 disabled:opacity-60"
        >
          {pending ? "Guardando…" : "Crear oportunidad"}
        </button>
      </div>
    </form>
  );
}
