import { getCurrentUser } from "@/server/users";
import { canAccess } from "@/lib/autorize";
import { redirect } from "next/navigation";

export default async function MemberLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const data = await getCurrentUser(); // cacheado — sem custo
  const role = data?.memberRole?.role ?? null;

  if (!role || !canAccess(role as "member", "member")) redirect("/");

  return <>{children}</>;
}
