import { AppNav } from "@/components/dashboard/app-nav";
import { requireActiveMembership } from "@/lib/auth/membership";

export const instant = false;

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const membership = await requireActiveMembership();
  const userLabel =
    membership.fullName || membership.email || membership.authUserId;

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-teal-50/40">
      <AppNav
        businessName={membership.businessName ?? "Negocio"}
        userLabel={userLabel}
      />
      <main className="mx-auto max-w-6xl px-4 py-8">{children}</main>
    </div>
  );
}
