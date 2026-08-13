import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { nextCookies } from "better-auth/next-js";
import { prisma } from "./prisma";

const googleClientId = process.env.GOOGLE_CLIENT_ID;
const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET;

if (!googleClientId || !googleClientSecret) {
  throw new Error("[auth] Faltan variables de entorno: GOOGLE_CLIENT_ID y/o GOOGLE_CLIENT_SECRET");
}

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),

  session: {
    expiresIn: 60 * 60, // 1 hora
    disableSessionRefresh: true,
  },

  trustedOrigins: process.env.NEXT_PUBLIC_URL ? [process.env.NEXT_PUBLIC_URL] : [],

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
      isSuperUser: {
        type: "boolean",
        required: false,
        defaultValue: false,
        input: false,
      },
    },
  },

  databaseHooks: {
    user: {
      // ✅ Todo usuário nasce com sua Person (organização só é vinculada ao entrar/criar uma org)
      create: {
        before: async (user) => {
          try {
            await prisma.person.create({
              data: {
                name: user.name || "Sin nombre",
                role: null,
                userId: user.id,
              },
            });
          } catch {
            // fallback: getCurrentUser recria a person se necessário
          }
          return { data: user };
        },
      },
    },
  },

  plugins: [nextCookies()], // sempre por último
});
