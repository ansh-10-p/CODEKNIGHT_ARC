import NextAuth from "next-auth"
import { authOptions } from "@/lib/auth-middleware"

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }
