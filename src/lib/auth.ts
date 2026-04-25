
import type { NextAuthOptions } from "next-auth"
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
      allowDangerousEmailAccountLinking: true, // ✅ ده الحل
    }),
    GithubProvider({
      clientId:     process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
      allowDangerousEmailAccountLinking: true, // ✅ ده الحل
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

        // Check locked
        if (user.lockedUntil && user.lockedUntil > new Date()) {
          throw new Error("Account locked. Try again later.")
        }

        const isValid = await bcrypt.compare(credentials.password, user.password)

        if (!isValid) {
          const failedLogins = user.failedLogins + 1
          await prisma.user.update({
            where: { id: user.id },
            data:  {
              failedLogins,
              ...(failedLogins >= 5 && {
                lockedUntil: new Date(Date.now() + 15 * 60 * 1000)
              })
            }
          })
          return null
        }

        // Reset on success
        await prisma.user.update({
          where: { id: user.id },
          data:  {
            failedLogins: 0,
            lockedUntil:  null,
            lastLoginAt:  new Date(),
          }
        })

        return {
          id:    user.id,
          email: user.email,
          name:  user.name,
          role:  user.role,
        }
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
  events: {
    // Auto-create workspace when signing in with OAuth
    async signIn({ user, account }) {
      if (account?.provider !== "credentials") {
        const existing = await prisma.workspace.findFirst({
          where: { members: { some: { userId: user.id! } } }
        })
        if (!existing) {
          const slug = `ws-${user.id}-${Date.now()}`
          await prisma.workspace.create({
            data: {
              name:       `${user.name}'s Workspace`,
              slug,
              isPersonal: true,
              members: {
                create: { userId: user.id!, role: "OWNER" }
              },
              settings: { create: {} },
              projects: {
                create: {
                  name:  "My First Project",
                  color: "#8b5cf6",
                  icon:  "⚡",
                  members: {
                    create: { userId: user.id!, role: "MANAGER" }
                  },
                  columns: {
                    create: [
                      { name: "Backlog",     order: 0, color: "#6b7280" },
                      { name: "To Do",       order: 1, color: "#3b82f6" },
                      { name: "In Progress", order: 2, color: "#8b5cf6" },
                      { name: "In Review",   order: 3, color: "#06b6d4" },
                      { name: "Done",        order: 4, color: "#22c55e" },
                    ]
                  }
                }
              }
            }
          })
        }
      }
    }
  },
  pages:   { signIn: "/login" },
  session: { strategy: "jwt" },
  secret:  process.env.NEXTAUTH_SECRET,
  debug:   process.env.NODE_ENV === "development",
}