import { createAccessControl } from "better-auth/plugins/access";
import {
  defaultStatements,
  adminAc,
  memberAc,
} from "better-auth/plugins/organization/access";

// ✅ Mescla statement padrão (organization, member, invitation) com o seu (project)
const statement = {
  ...defaultStatements, // ← inclui invitation: ["create", "cancel"]
  project: ["create", "share", "update", "delete"],
} as const;

const ac = createAccessControl(statement);

const member = ac.newRole({
  ...memberAc.statements, // ← permissões padrão do member
  project: ["create"],
});

const admin = ac.newRole({
  ...adminAc.statements, // ← permissões padrão do admin (inclui invitation:create)
  project: ["create", "update", "delete"],
});

const owner = ac.newRole({
  ...adminAc.statements, // ← owner herda tudo do admin
  project: ["create", "update", "delete", "share"],
  organization: ["update", "delete"], // ← owner pode deletar org
});

export { ac, admin, member, owner, statement };
