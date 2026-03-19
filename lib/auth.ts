import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { organization } from "better-auth/plugins";
import { nextCookies } from "better-auth/next-js";
import { prisma } from "./prisma";
import { ac, admin, member, owner } from "./auth/permissions";

const googleClientId = process.env.GOOGLE_CLIENT_ID;
const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET;

if (!googleClientId || !googleClientSecret) {
  throw new Error(
    "[auth] Faltan variables de entorno: GOOGLE_CLIENT_ID y/o GOOGLE_CLIENT_SECRET",
  );
}

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),

  session: {
    expiresIn: 60 * 60, // 1 hora
    disableSessionRefresh: true,
  },

  trustedOrigins: process.env.NEXT_PUBLIC_URL
    ? [process.env.NEXT_PUBLIC_URL]
    : [],

  socialProviders: {
    google: {
      clientId: googleClientId,
      clientSecret: googleClientSecret,
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
          const membership = await prisma.member.findFirst({
            where: { userId: session.userId },
            orderBy: { lastActiveAt: "desc" }, // ← última org acessada
            select: { organizationId: true },
          });

          return {
            data: {
              ...session,
              activeOrganizationId: membership?.organizationId ?? null,
            },
          };
        },
      },
    },
  },

  plugins: [
    organization({
      ac,
      roles: { owner, admin, member },
      invitationExpiresIn: 60 * 60 * 24,
    }),
    nextCookies(), // sempre por último
  ],
});
