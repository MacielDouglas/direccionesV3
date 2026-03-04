import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import MembersTableAction from "./MemberTableAction";
import MemberTableAdmin from "./MemberTableAdmin";
import type { Role } from "@/domains/member/types/role.types";

interface MembersTableProps {
  members: Array<{
    id: string;
    role: string | null;
    organizationId: string;
    user: {
      id: string;
      name: string;
      email: string;
      image: string | null;
    };
  }>;
}

export default function MembersTable({ members }: MembersTableProps) {
  return (
    <div className="mt-5 space-y-3 border-t pt-5">
      <div>
        <h2 className="text-lg font-semibold">Miembros</h2>
        <p className="text-sm text-muted-foreground">
          {members.length} miembro{members.length !== 1 && "s"}
        </p>
      </div>

      {/* MOBILE */}
      <ul className="flex flex-col gap-3 lg:hidden">
        {members.map((member) => (
          <li
            key={member.id}
            className="flex items-center gap-3 rounded-xl border bg-card p-3"
          >
            <Avatar className="size-10 shrink-0">
              <AvatarImage src={member.user.image ?? undefined} />
              <AvatarFallback>
                {member.user.name.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1 overflow-hidden">
              <p className="truncate text-sm font-medium">{member.user.name}</p>
              <p className="truncate text-xs text-muted-foreground">
                {member.user.email}
              </p>
              <span className="mt-1 inline-block rounded-full bg-muted px-2 py-0.5 text-[10px] uppercase">
                {member.role ?? "member"}
              </span>
            </div>

            <div className="flex gap-1">
              {member.role !== "owner" && (
                <MemberTableAdmin
                  organizationId={member.organizationId}
                  memberId={member.id}
                  memberRole={
                    (member.role ?? "member") as Exclude<Role, "owner">
                  }
                />
              )}
              {member.role !== "owner" && (
                <MembersTableAction
                  organizationId={member.organizationId}
                  memberIdOrEmail={member.user.id}
                />
              )}
            </div>
          </li>
        ))}
      </ul>

      {/* DESKTOP */}
      <div className="hidden overflow-x-auto lg:block">
        <table className="w-full border-collapse">
          <thead>
            <tr className="text-left text-sm text-muted-foreground">
              <th className="py-2">Usuario</th>
              <th>Email</th>
              <th>Rol</th>
              <th className="text-right">Acción</th>
            </tr>
          </thead>
          <tbody>
            {members.map((member) => (
              <tr key={member.id} className="border-t">
                <td className="flex items-center gap-3 py-3">
                  <Avatar className="size-8">
                    <AvatarImage src={member.user.image ?? undefined} />
                    <AvatarFallback>
                      {member.user.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm font-medium">
                    {member.user.name}
                  </span>
                </td>
                <td className="max-w-60 truncate text-sm">
                  {member.user.email}
                </td>
                <td className="text-sm">{member.role ?? "member"}</td>
                <td className="space-x-2 text-right">
                  {member.role !== "owner" && (
                    <MemberTableAdmin
                      organizationId={member.organizationId}
                      memberId={member.user.id}
                      memberRole={
                        (member.role ?? "member") as Exclude<Role, "owner">
                      }
                    />
                  )}
                  {member.role !== "owner" && (
                    <MembersTableAction
                      organizationId={member.organizationId}
                      memberIdOrEmail={member.user.id}
                    />
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
