// Helper function to get current user from localStorage (client-side)
import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

type AuthUser = {
  id: string;
  email: string;
  password: string;
  role: "student" | "teacher" | "canteen";
  name: string;
};

const authUsers: AuthUser[] = [
  {
    id: "student1",
    email: "rahul.sharma@student.edu",
    password: "Password@123",
    role: "student",
    name: "Rahul Sharma",
  },
  {
    id: "teacher1",
    email: "jane.doe@teacher.edu",
    password: "Password@123",
    role: "teacher",
    name: "Jane Doe",
  },
  {
    id: "canteen1",
    email: "canteen.manager@canteen.edu",
    password: "Password@123",
    role: "canteen",
    name: "Canteen Manager",
  },
];

export function findUserByCredentials(
  email: string,
  password: string,
  role: string,
) {
  return authUsers.find(
    (user) =>
      user.email.toLowerCase() === email.toLowerCase() &&
      user.password === password &&
      user.role === role,
  );
}

// ── Extend next-auth types ────────────────────────────────────────────────────
// (If you have a types/next-auth.d.ts file, you can move these there instead)
declare module "next-auth" {
  interface User {
    id: string;
    role?: string;
  }
  interface Session {
    user: {
      id: string;
      role?: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role?: string;
  }
}

// ─── authOptions ──────────────────────────────────────────────────────────────
export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        role: { label: "Role", type: "text" },
      },
      async authorize(credentials) {
        if (
          !credentials?.email ||
          !credentials?.password ||
          !credentials?.role
        ) {
          return null;
        }

        return (
          findUserByCredentials(
            credentials.email,
            credentials.password,
            credentials.role,
          ) ?? null
        );
      },
    }),
  ],

  session: { strategy: "jwt" },

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as { role?: string }).role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string | undefined;
      }
      return session;
    },
  },

  pages: {
    signIn: "/login",
  },

  secret: process.env.NEXTAUTH_SECRET || "dev-secret",
};

const STORAGE_KEYS = {
  isLoggedIn: "isLoggedIn",
  userRole: "userRole",
  currentUser: "currentUser",
};

function getStoredUser() {
  if (typeof window === "undefined") return null;
  const stored = window.localStorage.getItem(STORAGE_KEYS.currentUser);
  if (!stored) return null;

  try {
    return JSON.parse(stored);
  } catch {
    return null;
  }
}

export function isAuthenticatedAdmin() {
  if (typeof window === "undefined") return false;
  return (
    window.localStorage.getItem(STORAGE_KEYS.isLoggedIn) === "true" &&
    window.localStorage.getItem(STORAGE_KEYS.userRole) === "admin"
  );
}

export function redirectIfNotAuthenticatedAdmin() {
  const isAdmin = isAuthenticatedAdmin();
  if (!isAdmin && typeof window !== "undefined") {
    window.location.href = "/admin/login";
  }
  return isAdmin;
}

export function getCurrentAdminInfo() {
  const user = getStoredUser();
  return user?.role === "admin" ? user : null;
}

export function redirectIfNotAuthenticated() {
  if (typeof window === "undefined") return false;
  const isLoggedIn =
    window.localStorage.getItem(STORAGE_KEYS.isLoggedIn) === "true";
  if (!isLoggedIn) {
    window.location.href = "/login";
  }
  return isLoggedIn;
}

export function getCurrentTeacherInfo() {
  const user = getStoredUser();
  return user?.role === "teacher" ? user : null;
}

export function getCurrentTeacherId() {
  const user = getCurrentTeacherInfo();
  return user?.id ?? null;
}
