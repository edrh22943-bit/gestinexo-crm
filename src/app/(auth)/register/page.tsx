import { RegisterForm } from "@/components/auth/register-form";

export const instant = false;

export default async function RegisterPage({
  searchParams,
}: {
  searchParams: Promise<{ reason?: string }>;
}) {
  const params = await searchParams;
  const noMembership = params.reason === "no_membership";

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-xl font-semibold text-slate-900">Crear cuenta</h1>
      {noMembership ? (
        <p className="rounded-md bg-amber-50 px-3 py-2 text-sm text-amber-900">
          Tu usuario no tiene un negocio asociado. Completa el registro o pide
          a un admin que te agregue.
        </p>
      ) : null}
      <RegisterForm />
    </div>
  );
}
