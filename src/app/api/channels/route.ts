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
    const projectId   = searchParams.get("projectId")

    const channels = await prisma.channel.findMany({
      where: {
        ...(workspaceId ? { workspaceId } : {}),
        ...(projectId   ? { projectId   } : {}),
        OR: [
          { isPrivate: false },
          { members: { some: { userId } } }
        ]
      },
      include: {
        members:  { where: { userId }, select: { lastRead: true } },
        _count:   { select: { messages: true } },
        messages: {
          orderBy: { createdAt: "desc" },
          take:    1,
          include: { user: { select: { name: true } } }
        }
      },
      orderBy: { createdAt: "asc" }
    })

    return successResponse(channels)
  } catch (err) {
    console.error(err)
    return errorResponse("Internal server error", 500)
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) return errorResponse("Unauthorized", 401)

    const userId = (session.user as any).id
    const { name, workspaceId, projectId, type, isPrivate } = await req.json()

    const channel = await prisma.channel.create({
      data: {
        name,
        workspaceId,
        projectId,
        type:      type || "WORKSPACE",
        isPrivate: isPrivate || false,
        members:   { create: { userId } }
      }
    })

    return successResponse(channel, "Channel created", 201)
  } catch (err) {
    return errorResponse("Internal server error", 500)
  }
}