// app/join/[token]/page.tsx
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/server/users";
import { JoinScreen } from "@/features/invitations/ui/screens/JoinScreen";
import type { Metadata } from "next";

interface Props {
  params: Promise<{ token: string }>;
}

export const metadata: Metadata = {
  title: "Página de registro",
};

export default async function JoinPage({ params }: Props) {
  const { token } = await params;
  const data = await getCurrentUser();

  // ✅ Não logado → Google obrigatório
  if (!data) redirect(`/login?next=/join/${token}`);

  return <JoinScreen token={token} />;
}
