import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import * as bcrypt from "bcryptjs";
import { timingSafeEqual, createHash } from "crypto";
import { authConfig } from "./auth.config";
import prisma from "./app/lib/prisma";
import { PrismaAdapter } from "@auth/prisma-adapter";

// Config complète : Node.js runtime uniquement (API routes, Server Components)
export const { auth, handlers, signIn, signOut } = NextAuth({
  ...authConfig,
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },

  providers: [
    Google,
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Mot de passe", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email et mot de passe requis");
        }

        // 1. Chercher l'utilisateur dans la base de données
        const user = await prisma.user.findUnique({
          where: { email: credentials.email as string },
        });

        if (!user) {
          throw new Error("Utilisateur non trouvé");
        }

        let isAuthorized = false;
        let isFirstLogin = false; // Drapeau pour identifier l'utilisation du code temporaire

        // 2. La double vérification (Code temporaire VS Mot de passe hashé)

        // Cas A : Il a tapé le code temporaire exact qui est dans la colonne `tempCode`
        // (On vérifie d'abord que tempCode n'est pas null pour éviter les bugs)
        if (user.password) {
          const isValidPassword = await bcrypt.compare(
            credentials.password as string,
            user.password,
          );
          if (isValidPassword) {
            isAuthorized = true;
            isFirstLogin = false;
          }
        }

        // Si ce n'est pas le vrai mot de passe, on vérifie si c'est le code temporaire
        if (!isAuthorized && user.tempCode) {
          const hashedInput = createHash("sha256")
            .update(credentials.password as string)
            .digest("hex");
          const inputBuf = Buffer.from(hashedInput);
          const codeBuf = Buffer.from(user.tempCode);

          const matches =
            inputBuf.length === codeBuf.length &&
            timingSafeEqual(inputBuf, codeBuf);

          if (matches) {
            const now = new Date();
            if (!user.tempCodeExpiry || now > user.tempCodeExpiry) {
              throw new Error(
                "Ce code a expiré (validité 15 minutes). Veuillez en demander un nouveau.",
              );
            }
            isAuthorized = true;
            isFirstLogin = true;
          }
        }

        // 3. Si aucune des deux conditions n'est remplie
        if (!isAuthorized) {
          throw new Error("Mot de passe ou code d'accès incorrect");
        }

        // 4. Retourner l'utilisateur s'il est valide
        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
          isFirstLogin, // On passe l'info à NextAuth
        };
      },
    }),
  ],
  callbacks: {
    // 1. On intercepte le token juste après le login
    async jwt({ token, user }) {
      // Si "user" existe, c'est que l'utilisateur vient juste de se connecter (retour de "authorize")
      if (user) {
        token.id = user.id;
        token.isFirstLogin = user.isFirstLogin;
      }
      return token;
    },

    // 2. On passe les infos du token vers la session visible dans ton app
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.isFirstLogin = token.isFirstLogin as boolean;
      }
      return session;
    },
  },
});
