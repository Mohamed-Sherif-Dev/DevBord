import { getServerSession } from "next-auth"
import { authOptions }      from "@/lib/auth"
import { prisma }           from "@/lib/db"
import { successResponse, errorResponse } from "@/lib/response"

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) return errorResponse("Unauthorized", 401)

    const userId = (session.user as any).id
    const { searchParams } = new URL(req.url)
    const workspaceId = searchParams.get("workspaceId")

    // Get user's workspaces if no workspaceId
    const workspace = workspaceId
      ? await prisma.workspace.findFirst({ where: { id: workspaceId } })
      : await prisma.workspace.findFirst({
          where: { members: { some: { userId } } }
        })

    if (!workspace) return successResponse({ members: [], workspace: null })

    const members = await prisma.workspaceMember.findMany({
      where:   { workspaceId: workspace.id },
      include: {
        user: {
          select: {
            id:         true,
            name:       true,
            email:      true,
            image:      true,
            lastLoginAt:true,
            createdAt:  true,
          }
        }
      },
      orderBy: { joinedAt: "asc" }
    })

    // Add task count per member
    const membersWithStats = await Promise.all(
      members.map(async m => {
        const taskCount = await prisma.task.count({
          where: {
            assigneeId: m.userId,
            deletedAt:  null,
            status:     { not: "DONE" }
          }
        })
        return { ...m, taskCount }
      })
    )

    return successResponse({ members: membersWithStats, workspace })
  } catch (err) {
    console.error(err)
    return errorResponse("Internal server error", 500)
  }
}