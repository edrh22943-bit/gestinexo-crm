import Link from "next/link";
import { SignOutButton } from "./sign-out-button";

const links = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/contacts", label: "Contactos" },
  { href: "/leads", label: "Oportunidades" },
] as const;

export function AppNav({
  businessName,
  userLabel,
}: {
  businessName: string;
  userLabel: string;
}) {
  return (
    <header className="border-b border-slate-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-6">
          <Link href="/dashboard" className="text-lg font-bold text-teal-900">
            Gestinexo CRM
          </Link>
          <nav className="flex flex-wrap gap-1">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="rounded-md px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-teal-50 hover:text-teal-900"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
        <div className="flex items-center gap-3 text-sm text-slate-600">
          <div className="min-w-0">
            <p className="truncate font-medium text-slate-800">{businessName}</p>
            <p className="truncate text-xs">{userLabel}</p>
          </div>
          <SignOutButton />
        </div>
      </div>
    </header>
  );
}
