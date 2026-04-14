import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email y contraseña son requeridos");
        }

        // Credenciales de demo (mientras no haya DB real)
        const DEMO_EMAIL = "admin@gunnen.es";
        const DEMO_PASSWORD = "gunnen2024";

        if (
          credentials.email === DEMO_EMAIL &&
          credentials.password === DEMO_PASSWORD
        ) {
          return {
            id: "demo-admin",
            email: DEMO_EMAIL,
            name: "Admin Gunnen",
          };
        }

        // Con DB real: buscar en base de datos
        try {
          const user = await prisma.userAdmin.findUnique({
            where: { email: credentials.email },
          });

          if (!user) throw new Error("Credenciales inválidas");

          const isPasswordValid = await bcrypt.compare(
            credentials.password,
            user.passwordHash
          );

          if (!isPasswordValid) throw new Error("Credenciales inválidas");

          return { id: user.id, email: user.email, name: user.name };
        } catch {
          throw new Error("Credenciales inválidas");
        }
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/admin/login",
  },
  callbacks: {
    async redirect({ url, baseUrl }) {
      // Permite URLs relativas (ej: /admin/reservations)
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      // Permite URLs absolutas del mismo dominio
      try {
        if (new URL(url).origin === baseUrl) return url;
      } catch {
        // URL inválida — redirigir al baseUrl
      }
      return baseUrl;
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};
