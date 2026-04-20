import { NextRequest }  from "next/server"
import { prisma }       from "@/lib/db"
import bcrypt           from "bcryptjs"
import { slugify }      from "@/lib/utils"

export async function POST(req: NextRequest) {
  try {
    const { name, email, password } = await req.json()

    if (!name || !email || !password) {
      return Response.json({ message: "All fields required" }, { status: 400 })
    }

    if (password.length < 8) {
      return Response.json({ message: "Password must be at least 8 characters" }, { status: 400 })
    }

    const exists = await prisma.user.findUnique({ where: { email } })
    if (exists) {
      return Response.json({ message: "Email already registered" }, { status: 409 })
    }

    const hashed = await bcrypt.hash(password, 12)

    // Create user + workspace in one transaction
    const user = await prisma.user.create({
      data: { name, email, password: hashed },
    })

    // Auto-create personal workspace
    const slug = `${slugify(name)}-${Date.now()}`

    await prisma.workspace.create({
      data: {
        name:      `${name}'s Workspace`,
        slug,
        isPersonal: true,
        members: {
          create: { userId: user.id, role: "OWNER" }
        },
        settings: { create: {} },
        // Create default project
        projects: {
          create: {
            name:    "My First Project",
            color:   "#8b5cf6",
            icon:    "⚡",
            members: {
              create: { userId: user.id, role: "MANAGER" }
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

    return Response.json(
      { message: "Account created successfully", data: { id: user.id, name, email } },
      { status: 201 }
    )
  } catch (err: any) {
    console.error("Register error:", err)
    return Response.json({ message: "Internal server error" }, { status: 500 })
  }
}