import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { organization } from "better-auth/plugins";
import { nextCookies } from "better-auth/next-js";
import { prisma } from "./prisma";
import { getActiveOrganization } from "@/server/organizations";
import { ac, admin, member, owner } from "./auth/permissions";

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),

  /* 🔐 SESSÃO — ALTERAÇÃO PRINCIPAL */
  session: {
    expiresIn: 60 * 60, // 1 hora (3600s)
    disableSessionRefresh: true, // impede aumentar a duração automática
  },

  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    },
  },

  user: {
    additionalFields: {
      theme: {
        type: "string",
        required: false,
        defaultValue: "system",
        input: true,
      },
    },
  },

  databaseHooks: {
    session: {
      create: {
        before: async (session) => {
          const organization = await getActiveOrganization(session.userId);
          return {
            data: {
              ...session,
              activeOrganizationId: organization?.id,
            },
          };
        },
      },
    },
  },

  plugins: [
    organization({
      ac,
      roles: {
        owner,
        admin,
        member,
      },
    }),

    // ⚠️ Boa prática: sempre por último
    nextCookies(),
  ],
});
