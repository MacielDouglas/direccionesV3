import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import MembersTableAction from "./MemberTableAction";
import MemberTableAdmin from "./MemberTableAdmin";

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
    <div className="space-y-3 border-t mt-5 pt-5">
      {/* Header */}
      <div>
        <h2 className="text-lg font-semibold">Membros</h2>
        <p className="text-sm text-muted-foreground">
          {members.length} membro{members.length !== 1 && "s"}
        </p>
      </div>

      {/* MOBILE – Card list */}
      <ul className="flex flex-col gap-3 lg:hidden">
        {members.map((member) => (
          <li
            key={member.id}
            className="flex items-center gap-3 rounded-xl border p-3 bg-white dark:bg-zinc-800"
          >
            {/* Avatar */}
            <Avatar className="size-10 shrink-0">
              <AvatarImage src={member.user.image ?? undefined} />
              <AvatarFallback>
                {member.user.name.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            {/* Info */}
            <div className="flex-1 overflow-hidden">
              <p className="text-sm font-medium truncate">{member.user.name}</p>
              <p className="text-xs text-muted-foreground truncate">
                {member.user.email}
              </p>

              <span className="mt-1 inline-block rounded-full bg-muted px-2 py-0.5 text-[10px] uppercase">
                {member.role ?? "member"}
              </span>
            </div>
            {member.role !== "owner" && (
              <MemberTableAdmin
                organizationId={member.organizationId}
                userId={member.id}
                memberRole={member.role!}
              />
            )}
            {/* Action */}
            <MembersTableAction
              organizationId={member.organizationId}
              memberIdOrEmail={member.user.id}
            />
          </li>
        ))}
      </ul>

      {/* DESKTOP – Table */}
      <div className="hidden lg:block overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="text-left text-sm text-muted-foreground">
              <th className="py-2">Usuário</th>
              <th>Email</th>
              <th>Tipo</th>
              <th className="text-right">Ação</th>
            </tr>
          </thead>

          <tbody>
            {members.map((member) => (
              <tr key={member.id} className="border-t">
                <td className="py-3 flex items-center gap-3">
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

                <td className="text-sm truncate max-w-60]">
                  {member.user.email}
                </td>

                <td className="text-sm">{member.role ?? "member"}</td>

                <td className="text-right space-x-2">
                  {member.role !== "owner" && (
                    <MemberTableAdmin
                      organizationId={member.organizationId}
                      userId={member.user.id}
                      memberRole={member.role!}
                    />
                  )}
                  <MembersTableAction
                    organizationId={member.organizationId}
                    memberIdOrEmail={member.user.id}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
