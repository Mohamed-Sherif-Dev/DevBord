import NextAuth, { NextAuthOptions } from "next-auth";
import { PrismaAdapter }        from "@auth/prisma-adapter"
import GoogleProvider           from "next-auth/providers/google"
import GithubProvider           from "next-auth/providers/github"
import CredentialsProvider      from "next-auth/providers/credentials"
import { prisma }               from "./db"
import bcrypt                   from "bcryptjs"

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma) as any,
  providers: [
    GoogleProvider({
      clientId:     process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    GithubProvider({
      clientId:     process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    }),
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email:    { label: "Email",    type: "email"    },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null

        const user = await prisma.user.findUnique({
          where: { email: credentials.email }
        })

        if (!user || !user.password || !user.isActive) return null

        // Check if locked
        if (user.lockedUntil && user.lockedUntil > new Date()) return null

        const isValid = await bcrypt.compare(credentials.password, user.password)

        if (!isValid) {
          // Increment failed logins
          const failedLogins = user.failedLogins + 1
          await prisma.user.update({
            where: { id: user.id },
            data:  {
              failedLogins,
              // Lock after 5 attempts for 15 minutes
              ...(failedLogins >= 5 && {
                lockedUntil: new Date(Date.now() + 15 * 60 * 1000)
              })
            }
          })
          return null
        }

        // Reset failed logins on success
        await prisma.user.update({
          where: { id: user.id },
          data:  { failedLogins: 0, lockedUntil: null, lastLoginAt: new Date() }
        })

        return { id: user.id, email: user.email, name: user.name, role: user.role }
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id   = user.id
        token.role = (user as any).role
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        ;(session.user as any).id   = token.id
        ;(session.user as any).role = token.role
      }
      return session
    }
  },
  pages:   { signIn: "/login" },
  session: { strategy: "jwt", maxAge: 7 * 24 * 60 * 60 },
  secret:  process.env.NEXTAUTH_SECRET,
}