import { getServerSession } from "next-auth"
import { authOptions }      from "@/lib/auth"
import { prisma }           from "@/lib/db"
import { successResponse, errorResponse } from "@/lib/response"
import { z }                from "zod"
import { slugify }          from "@/lib/utils"

const createSchema = z.object({
  name:  z.string().min(2).max(100),
  color: z.string().default("#8b5cf6"),
})

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) return errorResponse("Unauthorized", 401)

    const userId = (session.user as any).id
    const body   = await req.json()
    const parsed = createSchema.safeParse(body)
    if (!parsed.success) return errorResponse(parsed.error.issues[0].message)

    const slug = slugify(parsed.data.name)

    const exists = await prisma.workspace.findUnique({ where: { slug } })
    if (exists) return errorResponse("Workspace name already taken", 409)

    const workspace = await prisma.workspace.create({
      data: {
        name:    parsed.data.name,
        slug:    slug + "-" + Date.now(),
        color:   parsed.data.color,
        members: {
          create: { userId, role: "OWNER" }
        },
        settings: { create: {} }
      },
      include: {
        members: true,
        settings: true,
      }
    })

    return successResponse(workspace, "Workspace created", 201)
  } catch (err) {
    console.error(err)
    return errorResponse("Internal server error", 500)
  }
}


export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) return errorResponse("Unauthorized", 401)

    const userId = (session.user as any).id

    const workspaces = await prisma.workspace.findMany({
      where: {
        members:   { some: { userId } },
        deletedAt: null,
      },
      include: {
        _count: { select: { members: true, projects: true } },
        members: {
          where:  { userId },
          select: { role: true }
        }
      },
      orderBy: { createdAt: "asc" }
    })

    return successResponse(workspaces)
  } catch (err) {
    console.error(err)
    return errorResponse("Internal server error", 500)
  }
}