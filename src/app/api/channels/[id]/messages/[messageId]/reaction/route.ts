import { getServerSession } from "next-auth"
import { authOptions }      from "@/lib/auth"
import { prisma }           from "@/lib/db"
import { getPusherServer }     from "@/lib/pusher"
import { successResponse, errorResponse } from "@/lib/response"

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string; messageId: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) return errorResponse("Unauthorized", 401)

    const { id, messageId } = await params
    const userId = (session.user as any).id
    const { emoji } = await req.json()

    // Toggle reaction
    const existing = await prisma.reaction.findUnique({
      where: { messageId_userId_emoji: { messageId, userId, emoji } }
    })

    if (existing) {
      await prisma.reaction.delete({ where: { id: existing.id } })
    } else {
      await prisma.reaction.create({ data: { messageId, userId, emoji } })
    }

    // Get updated reactions
    const reactions = await prisma.reaction.findMany({
      where:   { messageId },
      include: { user: { select: { id: true, name: true } } }
    })

    // await pusherServer.trigger(
    //   `channel-${id}`,
    //   "reaction-updated",
    //   { messageId, reactions }
    // )
    const pusher = getPusherServer()
    if (pusher) {
      await pusher.trigger(`channel-${id}`, "reaction-updated", { messageId, reactions })
    }

    return successResponse(reactions)
  } catch (err) {
    return errorResponse("Internal server error", 500)
  }
}