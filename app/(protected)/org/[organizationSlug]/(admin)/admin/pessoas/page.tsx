import { redirect } from "next/navigation";

interface Props {
  params: Promise<{ organizationSlug: string }>;
}

export default async function PeoplePageRedirect({ params }: Props) {
  const { organizationSlug } = await params;
  redirect(`/org/${organizationSlug}/admin/gestao`);
}
