"use client";

import { useTransition } from "react";
import { signOutAction } from "@/app/(auth)/actions";

export function SignOutButton() {
  const [pending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => startTransition(() => signOutAction())}
      className="rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-50 disabled:opacity-60"
    >
      {pending ? "Saliendo…" : "Salir"}
    </button>
  );
}
