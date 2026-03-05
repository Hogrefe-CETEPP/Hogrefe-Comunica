import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcrypt";
import { v4 as uuid } from "uuid";
import { redirect } from "next/navigation";
import pool from "./db";
import type { RowDataPacket } from "mysql2";

const loginAttempts = new Map<
  string,
  { count: number; firstAttempt: number }
>();

const RATE_LIMIT_MAX_ATTEMPTS = 5;
const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000;

function checkRateLimit(email: string): {
  allowed: boolean;
  remainingAttempts: number;
} {
  const now = Date.now();
  const attempts = loginAttempts.get(email);

  if (!attempts) {
    return { allowed: true, remainingAttempts: RATE_LIMIT_MAX_ATTEMPTS };
  }

  if (now - attempts.firstAttempt > RATE_LIMIT_WINDOW_MS) {
    loginAttempts.delete(email);
    return { allowed: true, remainingAttempts: RATE_LIMIT_MAX_ATTEMPTS };
  }

  const remainingAttempts = RATE_LIMIT_MAX_ATTEMPTS - attempts.count;
  return {
    allowed: attempts.count < RATE_LIMIT_MAX_ATTEMPTS,
    remainingAttempts,
  };
}

function recordLoginAttempt(email: string): void {
  const now = Date.now();
  const attempts = loginAttempts.get(email);

  if (!attempts || now - attempts.firstAttempt > RATE_LIMIT_WINDOW_MS) {
    loginAttempts.set(email, { count: 1, firstAttempt: now });
  } else {
    attempts.count += 1;
  }
}

function resetLoginAttempts(email: string): void {
  loginAttempts.delete(email);
}

interface UserRow extends RowDataPacket {
  id: string;
  email: string;
  role: string;
  password: string;
  name: string;
  sessionToken: string | null;
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email", placeholder: "jsmith" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Senha e/ou login incompletos!");
        }

        const { allowed, remainingAttempts } = checkRateLimit(
          credentials.email,
        );
        if (!allowed) {
          throw new Error(
            "Muitas tentativas de login. Tente novamente em 1 hora.",
          );
        }

        const [rows] = await pool.execute<UserRow[]>(
          "SELECT id, email, role, password, name FROM userscomunicados WHERE email = ? LIMIT 1",
          [credentials.email],
        );

        const findUser = rows[0];

        if (!findUser) {
          recordLoginAttempt(credentials.email);
          throw new Error(
            `Usuário inexistente! (${remainingAttempts - 1} tentativas restantes)`,
          );
        }

        const isValidPassword = await bcrypt.compare(
          credentials.password,
          findUser.password,
        );

        if (!isValidPassword) {
          recordLoginAttempt(credentials.email);
          throw new Error(
            `Senha incorreta! (${remainingAttempts - 1} tentativas restantes)`,
          );
        }

        resetLoginAttempts(credentials.email);

        const newSessionToken = uuid();

        await pool.execute(
          "UPDATE userscomunicados SET sessionToken = ? WHERE id = ?",
          [newSessionToken, findUser.id],
        );

        return {
          id: findUser.id,
          name: findUser.name,
          email: findUser.email,
          role: findUser.role,
          sessionToken: newSessionToken,
        };
      },
    }),
  ],
  callbacks: {
    //@ts-ignore
    async jwt({ token, user }) {
      if (user) {
        return {
          ...token,
          //@ts-ignore
          role: user.role,
          id: user.id,
          //@ts-ignore
          sessionToken: user.sessionToken,
        };
      }

      return token;
    },
    //@ts-ignore
    async session({ session, token }) {
      if (session.user) {
        //@ts-ignore
        session.user.role = token.role as string;
        //@ts-ignore
        session.user.id = token.id as string;

        // Verifica se o sessionToken ainda é o mesmo
        const [rows] = await pool.execute<UserRow[]>(
          "SELECT sessionToken FROM userscomunicados WHERE id = ? LIMIT 1",
          [token.id as string],
        );

        const user = rows[0];

        if (!user || user.sessionToken !== token.sessionToken) {
          return null; // Força logout
        }
      }

      return session;
    },
  },
  pages: {
    signIn: "/",
    signOut: "/",
    error: "/",
  },
};

export async function getCurrentUser() {
  const { getServerSession } = await import("next-auth/next");
  const session = await getServerSession(authOptions);
  //@ts-ignore
  if (!session?.user?.id) {
    return redirect("/");
  }

  return {
    //@ts-ignore
    id: session.user.id,
    //@ts-ignore
    email: session.user.email!,
    //@ts-ignore
    name: session.user.name,
    //@ts-ignore
    role: session.user.role,
  };
}
