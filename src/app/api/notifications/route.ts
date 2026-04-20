import { getServerSession } from "next-auth"
import { authOptions }      from "@/lib/auth"
import { prisma }           from "@/lib/db"
import { successResponse, errorResponse } from "@/lib/response"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) return errorResponse("Unauthorized", 401)

    const userId = (session.user as any).id

    const [notifications, unreadCount] = await Promise.all([
      prisma.notification.findMany({
        where:   { userId },
        orderBy: { createdAt: "desc" },
        take:    20,
      }),
      prisma.notification.count({
        where: { userId, isRead: false }
      })
    ])

    return successResponse({ notifications, unreadCount })
  } catch (err) {
    return errorResponse("Internal server error", 500)
  }
}

export async function PATCH(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) return errorResponse("Unauthorized", 401)

    const userId = (session.user as any).id
    const { ids } = await req.json()

    if (ids?.length) {
      await prisma.notification.updateMany({
        where: { id: { in: ids }, userId },
        data:  { isRead: true, readAt: new Date() }
      })
    } else {
      // Mark all
      await prisma.notification.updateMany({
        where: { userId, isRead: false },
        data:  { isRead: true, readAt: new Date() }
      })
    }

    return successResponse(null, "Marked as read")
  } catch (err) {
    return errorResponse("Internal server error", 500)
  }
}