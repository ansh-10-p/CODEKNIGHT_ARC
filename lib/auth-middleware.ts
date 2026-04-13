// Helper function to get current user from localStorage (client-side)
import { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { connectToDatabase } from "@/lib/db"
 
// ── Extend next-auth types ────────────────────────────────────────────────────
// (If you have a types/next-auth.d.ts file, you can move these there instead)
declare module "next-auth" {
  interface User {
    id: string
    role?: string
  }
  interface Session {
    user: {
      id: string
      role?: string
      name?: string | null
      email?: string | null
      image?: string | null
    }
  }
}
 
declare module "next-auth/jwt" {
  interface JWT {
    id: string
    role?: string
  }
}
 
// ─── authOptions ──────────────────────────────────────────────────────────────
export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email:    { label: "Email",    type: "email"    },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null
 
        try {
          await connectToDatabase()
 
          // ── Replace the block below with your actual User model ──
          // Example with bcrypt:
          //
          // import User from "@/lib/user-model"
          // import bcrypt from "bcryptjs"
          //
          // const user = await User.findOne({ email: credentials.email })
          // if (!user) return null
          // const valid = await bcrypt.compare(credentials.password, user.password)
          // if (!valid) return null
          // return { id: user._id.toString(), email: user.email, name: user.name, role: user.role }
 
          console.warn("authorize(): No user model wired up yet — returning null")
          return null
        } catch (err) {
          console.error("authorize() error:", err)
          return null
        }
      },
    }),
  ],
 
  session: { strategy: "jwt" },
 
  callbacks: {
    async jwt({ token, user }) {
      // Runs on sign-in: attach extra fields to the JWT
      if (user) {
        token.id   = user.id
        token.role = (user as { role?: string }).role
      }
      return token
    },
    async session({ session, token }) {
      // Runs on every request: expose token fields on session.user
      if (session.user) {
        session.user.id   = token.id   as string
        session.user.role = token.role as string | undefined
      }
      return session
    },
  },
 
  pages: {
    signIn: "/login",
  },
 
  secret: process.env.NEXTAUTH_SECRET,
}