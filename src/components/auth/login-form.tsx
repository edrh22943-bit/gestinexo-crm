"use client";

import { useActionState } from "react";
import Link from "next/link";
import { loginAction, type AuthActionState } from "@/app/(auth)/actions";

const initial: AuthActionState = {};

export function LoginForm({ nextPath }: { nextPath: string }) {
  const [state, formAction, pending] = useActionState(loginAction, initial);

  return (
    <form action={formAction} className="flex w-full max-w-md flex-col gap-4">
      <input type="hidden" name="next" value={nextPath} />
      <label className="flex flex-col gap-1 text-sm">
        <span className="font-medium text-slate-700">Email</span>
        <input
          name="email"
          type="email"
          required
          autoComplete="email"
          className="rounded-md border border-slate-300 bg-white px-3 py-2 text-slate-900 outline-none ring-teal-600 focus:ring-2"
        />
      </label>
      <label className="flex flex-col gap-1 text-sm">
        <span className="font-medium text-slate-700">Contraseña</span>
        <input
          name="password"
          type="password"
          required
          autoComplete="current-password"
          className="rounded-md border border-slate-300 bg-white px-3 py-2 text-slate-900 outline-none ring-teal-600 focus:ring-2"
        />
      </label>
      {state.error ? (
        <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">
          {state.error}
        </p>
      ) : null}
      <button
        type="submit"
        disabled={pending}
        className="rounded-md bg-teal-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-teal-800 disabled:opacity-60"
      >
        {pending ? "Entrando…" : "Iniciar sesión"}
      </button>
      <p className="text-center text-sm text-slate-600">
        ¿No tienes cuenta?{" "}
        <Link href="/register" className="font-medium text-teal-800 underline">
          Regístrate
        </Link>
      </p>
    </form>
  );
}
