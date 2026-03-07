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
    <div className="flex min-h-svh flex-col overflow-hidden bg-surface-light text-surface-dark dark:bg-surface-dark dark:text-surface-light">
      <Header
        session={data.session.session}
        role={data.activeMember?.role ?? null}
        organization={data.activeOrganization}
      />
      <main
        id="main-content"
        className="flex-1 min-h-0 flex flex-col overflow-hidden"
      >
        {children}
      </main>
      <Footer organization={data.activeOrganization} />
    </div>
  );
}
