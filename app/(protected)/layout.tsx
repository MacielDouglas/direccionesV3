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
    <div className="flex flex-col bg-primary-lgt dark:bg-primary-drk text-primary-drk dark:text-primary-lgt">
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
