import Footer from "@/components/footer/Footer";
import Header from "@/components/header/Header";
import { BottomTabBar } from "@/components/navigation/BottomTabBar";
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
    <div className="flex min-h-svh flex-col overflow-hidden bg-background text-foreground">
      <Header
        session={data.session.session}
        role={data.memberRole?.role ?? null}
        organization={data.activeOrganization}
        isSuperUser={data.isSuperUser}
        hasPerson={Boolean(data.person)}
      />
      <main id="main-content" className="flex-1 min-h-0 flex flex-col overflow-hidden">
        {children}
      </main>
      <Footer organization={data.activeOrganization} />
      {data.activeOrganization?.slug && (
        <BottomTabBar orgSlug={data.activeOrganization.slug} role={data.memberRole?.role ?? null} />
      )}
    </div>
  );
}
