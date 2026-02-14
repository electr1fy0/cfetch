import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import Google from "next-auth/providers/google";
import prisma from "./lib/prisma";
export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [Google],
  adapter: PrismaAdapter(prisma),
});
