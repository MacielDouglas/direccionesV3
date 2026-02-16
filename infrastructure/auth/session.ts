import { auth } from "@/lib/auth";
import { mapAuthRole } from "./mapRole";
// import { authClient } from "@/lib/auth-client";
import { headers } from "next/headers";

export async function getSession() {
  const session = await auth.api.getSession({ headers: await headers() });
  const role = await auth.api.getActiveMemberRole({ headers: await headers() });

  console.log("DATASWSW", role);

  if (!session) return null;

  return {
    user: {
      id: session.user.id,
      // id: data.user.id,
      role: mapAuthRole(role.role),
    },
  };
}
