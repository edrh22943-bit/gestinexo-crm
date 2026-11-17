export const instant = false;

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-teal-50 to-slate-200">
      <div className="mx-auto flex min-h-screen max-w-lg flex-col justify-center px-4 py-12">
        <div className="mb-8 text-center">
          <p className="text-3xl font-bold tracking-tight text-teal-900">
            Gestinexo CRM
          </p>
          <p className="mt-2 text-sm text-slate-600">
            Gestión comercial multiempresa
          </p>
        </div>
        <div className="rounded-xl border border-slate-200/80 bg-white/90 p-6 shadow-sm backdrop-blur">
          {children}
        </div>
      </div>
    </div>
  );
}
