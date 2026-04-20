import { getServerSession } from "next-auth"
import { authOptions }      from "@/lib/auth"
import { prisma }           from "@/lib/db"
import { successResponse, errorResponse } from "@/lib/response"
import { z } from "zod"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) return errorResponse("Unauthorized", 401)

    const userId = (session.user as any).id

    const projects = await prisma.project.findMany({
      where: {
        deletedAt: null,
        workspace: {
          members: { some: { userId } }
        }
      },
      include: {
        members: {
          include: {
            user: { select: { id: true, name: true, image: true } }
          },
          take: 5,
        },
        _count: {
          select: {
            tasks:   { where: { deletedAt: null } },
            members: true,
          }
        },
      },
      orderBy: { updatedAt: "desc" },
    })

    const projectsWithProgress = await Promise.all(
      projects.map(async p => {
        const doneCount = await prisma.task.count({
          where: { projectId: p.id, status: "DONE", deletedAt: null }
        })
        return { ...p, doneCount }
      })
    )

    return successResponse(projectsWithProgress)
  } catch (err) {
    console.error(err)
    return errorResponse("Internal server error", 500)
  }
}

const createSchema = z.object({
  name:        z.string().min(2).max(100),
  description: z.string().optional(),
  color:       z.string().default("#8b5cf6"),
  icon:        z.string().optional(),
  isPublic:    z.boolean().default(false),
  workspaceId: z.string(),
})

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) return errorResponse("Unauthorized", 401)

    const userId = (session.user as any).id
    const body   = await req.json()
    const parsed = createSchema.safeParse(body)
    if (!parsed.success) return errorResponse(parsed.error.issues[0].message)

    const { workspaceId, ...data } = parsed.data

    // Check workspace membership
    const member = await prisma.workspaceMember.findFirst({
      where: { workspaceId, userId }
    })
    if (!member) return errorResponse("Not a workspace member", 403)

    const project = await prisma.project.create({
      data: {
        ...data,
        workspaceId,
        members: {
          create: { userId, role: "MANAGER" }
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
      },
      include: {
        columns: true,
        members: {
          include: { user: { select: { id: true, name: true, image: true } } }
        },
      }
    })

    // Log activity
    await prisma.activityLog.create({
      data: {
        projectId:   project.id,
        userId,
        type:        "PROJECT_CREATED",
        description: `Created project "${project.name}"`,
      }
    })

    return successResponse(project, "Project created", 201)
  } catch (err) {
    console.error(err)
    return errorResponse("Internal server error", 500)
  }
}