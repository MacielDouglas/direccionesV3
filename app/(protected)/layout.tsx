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

  if (!data?.session.session) redirect("/login");

  return (
    <div className="flex flex-col bg-primary-lgt dark:bg-primary-drk text-primary-drk dark:text-primary-lgt">
      <Header
        // user={user}
        session={data.session.session}
        role={data.activeMember?.role ?? null}
        organization={data.activeOrganization}
      />
      <main className="flex-1">{children}</main>
      <Footer organization={data.activeOrganization} />
    </div>
  );
}
