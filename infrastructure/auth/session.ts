import { auth } from "@/lib/auth";
import { mapAuthRole } from "./mapRole";
import { headers } from "next/headers";

export async function getSession() {
  const reqHeaders = await headers();

  const [session, memberRole] = await Promise.all([
    auth.api.getSession({ headers: reqHeaders }),
    auth.api.getActiveMemberRole({ headers: reqHeaders }).catch(() => null),
  ]);

  if (!session) return null;

  return {
    user: {
      id: session.user.id,
      role: memberRole?.role ? mapAuthRole(memberRole.role) : null,
    },
  };
}
