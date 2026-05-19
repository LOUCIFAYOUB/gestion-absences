import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

const handler = NextAuth({
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        username: { label: "Nom d'utilisateur", type: "text" },
        password: { label: "Mot de passe", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) {
          return null;
        }

        const manager = await prisma.manager.findUnique({
          where: { username: credentials.username },
        });

        if (!manager) {
          return null;
        }

        const isValid = await bcrypt.compare(
          credentials.password,
          manager.password_hash
        );

        if (!isValid) {
          return null;
        }

        return {
          id: String(manager.id),
          name: manager.username,
          email: manager.email,
        };
      },
    }),
  ],
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
});

export { handler as GET, handler as POST };