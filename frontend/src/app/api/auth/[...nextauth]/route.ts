import NextAuth from "next-auth";
import type { Session, User } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcrypt";
import type { JWT } from "next-auth/jwt";

export const authOptions = {
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: "jwt" as const,
  },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email", placeholder: "tu@correo.com" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Credenciales inválidas");
        }
        const user = await prisma.user.findUnique({ where: { email: credentials.email } });
        if (!user) throw new Error("No existe el usuario");
        // En este flujo, `password` no está en el modelo primario, pero lo agregaremos via `accounts` o campo extra.
        // Aquí asumimos uso manual de campo `hashedPassword` en `User`.
        const hashedPassword = (user as any).hashedPassword as string | undefined;
        if (!hashedPassword || !(await bcrypt.compare(credentials.password, hashedPassword))) {
          throw new Error("Contraseña incorrecta");
        }
        return { id: user.id, name: user.name, email: user.email };
      },
    }),
  ],
  pages: {
    signIn: "/login",
    error: "/login", // Error URL
  },
  callbacks: {
    async jwt({ token, user }: { token: JWT; user?: User }) {
      if (user) {
        token.id = user.id;
      }

      return token;
    },
    async session({ session, token }: { session: Session; token: JWT }) {
      if (session.user) {
        session.user.id = token.id as string;
      }

      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
