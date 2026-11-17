"use client";

import { useActionState } from "react";
import {
  createContactAction,
  type ContactActionState,
} from "@/app/(dashboard)/contacts/actions";

const initial: ContactActionState = {};

export function ContactCreateForm() {
  const [state, formAction, pending] = useActionState(
    createContactAction,
    initial,
  );

  return (
    <form
      action={formAction}
      className="grid gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:grid-cols-2"
    >
      <h2 className="sm:col-span-2 text-sm font-semibold text-slate-800">
        Nuevo contacto
      </h2>
      <label className="flex flex-col gap-1 text-sm">
        <span className="font-medium text-slate-700">Nombre</span>
        <input
          name="name"
          required
          className="rounded-md border border-slate-300 px-3 py-2 outline-none ring-teal-600 focus:ring-2"
        />
      </label>
      <label className="flex flex-col gap-1 text-sm">
        <span className="font-medium text-slate-700">Teléfono (E.164)</span>
        <input
          name="phoneE164"
          placeholder="+51987654321"
          className="rounded-md border border-slate-300 px-3 py-2 outline-none ring-teal-600 focus:ring-2"
        />
      </label>
      <label className="flex flex-col gap-1 text-sm sm:col-span-2">
        <span className="font-medium text-slate-700">Email</span>
        <input
          name="email"
          type="email"
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
          {pending ? "Guardando…" : "Crear contacto"}
        </button>
      </div>
    </form>
  );
}
