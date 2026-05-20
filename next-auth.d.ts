import { type DefaultSession } from "next-auth";
import "next-auth/jwt";

// On ouvre le module "next-auth" pour y injecter nos champs
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      isFirstLogin?: boolean;
    } & DefaultSession["user"];
  }

  interface User {
    isFirstLogin?: boolean;
  }
}

// On ouvre le module "next-auth/jwt" pour modifier le token
declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    isFirstLogin?: boolean;
  }
}
