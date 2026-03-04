import Footer from "@/components/footer/Footer";
import Header from "@/components/header/Header";
import { getCurrentUser } from "@/server/users";
import { redirect } from "next/navigation";

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const data = await getCurrentUser();

  if (!data) redirect("/login");

  return (
    <div className="flex min-h-svh flex-col bg-surface-light text-surface-dark dark:bg-surface-dark dark:text-surface-light">
      <Header
        session={data.session.session}
        role={data.activeMember?.role ?? null}
        organization={data.activeOrganization}
      />
      <main className="flex-1">{children}</main>
      <Footer organization={data.activeOrganization} />
    </div>
  );
}
