import { JoinScreen } from "@/features/invitations/ui/screens/JoinScreen";
import { getServerDictionary } from "@/lib/i18n/server";
import { getCurrentUser } from "@/server/users";
import type { Metadata } from "next";
import { redirect } from "next/navigation";

interface Props {
  params: Promise<{ token: string }>;
}

export async function generateMetadata(): Promise<Metadata> {
  const t = await getServerDictionary();
  return { title: t.invitations.joinTitle };
}

export default async function JoinPage({ params }: Props) {
  const { token } = await params;
  const data = await getCurrentUser();

  // ✅ Não logado → Google obrigatório
  if (!data) redirect(`/login?next=/join/${token}`);

  return <JoinScreen token={token} />;
}
