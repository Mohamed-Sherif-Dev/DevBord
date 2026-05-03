import { getServerSession } from "next-auth"
import { authOptions }      from "@/lib/auth"
import { prisma }           from "@/lib/db"
import { getPusherServer }     from "@/lib/pusher"
import { successResponse, errorResponse } from "@/lib/response"
import { m } from "framer-motion"

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) return errorResponse("Unauthorized", 401)

    const { id } = await params
    const { searchParams } = new URL(req.url)
    const cursor = searchParams.get("cursor")
    const limit  = 30

    const messages = await prisma.message.findMany({
      where:   { channelId: id, deletedAt: null },
      include: {
        user:      { select: { id: true, name: true, image: true } },
        reactions: { include: { user: { select: { id: true, name: true } } } },
        replyTo: {
          include: { user: { select: { id: true, name: true } } }
        },
        mentions: { include: { user: { select: { id: true, name: true } } } },
      },
      orderBy: { createdAt: "desc" },
      take:    limit + 1,
      ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {})
    })

    const hasMore = messages.length > limit
    if (hasMore) messages.pop()

    return successResponse({
      messages: messages.reverse(),
      hasMore,
      nextCursor: hasMore ? messages[0]?.id : null
    })
  } catch (err) {
    return errorResponse("Internal server error", 500)
  }
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) return errorResponse("Unauthorized", 401)

    const { id }    = await params
    const userId    = (session.user as any).id
    const { content, replyToId, mentions, fileUrl, fileName, fileType } = await req.json()

    if (!content?.trim() && !fileUrl) return errorResponse("Message cannot be empty")

    const message = await prisma.message.create({
      data: {
        channelId: id,
        userId,
        content:   content || "",
        replyToId: replyToId || null,
        fileUrl:   fileUrl   || null,
        fileName:  fileName  || null,
        fileType:  fileType  || null,
        ...(mentions?.length ? {
          mentions: {
            create: mentions.map((uid: string) => ({ userId: uid }))
          }
        } : {})
      },
      include: {
        user:      { select: { id: true, name: true, image: true } },
        reactions: true,
        replyTo: {
          include: { user: { select: { id: true, name: true } } }
        },
        mentions: { include: { user: { select: { id: true, name: true } } } },
      }
    })

    // Send notifications for mentions
    if (mentions?.length) {
      await Promise.all(mentions.map((uid: string) =>
        prisma.notification.create({
          data: {
            userId:  uid,
            type:    "COMMENT_ADDED",
            title:   "You were mentioned!",
            message: `${session.user?.name} mentioned you in a message`,
            link:    `/chat`,
          }
        })
      ))
    }

    // Trigger Pusher
    // const pusherServer = getPusherServer()
    // if (pusherServer) {
    //   await pusherServer.trigger(
    //     `channel-${id}`,
    //     "new-message",
    //     message
    //   )
    // }ush

    const pusher = getPusherServer()
    if (pusher) {
      await pusher.trigger(`channel-${id}`, "new-message", message)
    }

    return successResponse(message, "Message sent", 201)
  } catch (err) {
    console.error(err)
    return errorResponse("Internal server error", 500)
  }
}