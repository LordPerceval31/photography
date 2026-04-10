import type { NextAuthConfig } from "next-auth";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";

// Config Edge-compatible : pas de Prisma, pas de bcrypt
// Utilisée par proxy.ts (Edge Runtime)
// ATTENTION : ces callbacks sont utilisés UNIQUEMENT par proxy.ts.
// auth.ts redéfinit ses propres callbacks plus complets pour le Node runtime.
export const authConfig = {
  providers: [Google, Credentials({})],
  pages: {
    signIn: "/login",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.isFirstLogin = user.isFirstLogin;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.isFirstLogin = token.isFirstLogin;
      }
      return session;
    },
  },
} satisfies NextAuthConfig;
