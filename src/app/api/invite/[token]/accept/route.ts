import { getServerSession } from "next-auth"
import { authOptions }      from "@/lib/auth"
import { prisma }           from "@/lib/db"

export async function POST(
  req: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return Response.json({ message: "Please sign in first" }, { status: 401 })
    }

    const { token } = await params
    const userId    = (session.user as any).id

    const invite = await prisma.invitation.findUnique({
      where: { token }
    })

    if (!invite)           return Response.json({ message: "Invitation not found"  }, { status: 404 })
    if (invite.acceptedAt) return Response.json({ message: "Already accepted"      }, { status: 409 })
    if (invite.expiresAt < new Date()) {
      return Response.json({ message: "Invitation expired" }, { status: 410 })
    }

    // ✅ تأكد إن الإيميل بتاع الـ user نفس الإيميل في الدعوة
    if (session.user.email?.toLowerCase() !== invite.email.toLowerCase()) {
      return Response.json({
        message: `This invitation is for ${invite.email}. Please sign in with that email.`
      }, { status: 403 })
    }

    // Add to workspace
    const existing = await prisma.workspaceMember.findFirst({
      where: { workspaceId: invite.workspaceId, userId }
    })

    if (!existing) {
      await prisma.workspaceMember.create({
        data: {
          workspaceId: invite.workspaceId,
          userId,
          role: invite.role,
        }
      })
    }

    // Mark accepted
    await prisma.invitation.update({
      where: { token },
      data:  { acceptedAt: new Date() }
    })

    // Notify owner
    const owner = await prisma.workspaceMember.findFirst({
      where: { workspaceId: invite.workspaceId, role: "OWNER" }
    })

    if (owner) {
      await prisma.notification.create({
        data: {
          userId:  owner.userId,
          type:    "MEMBER_JOINED",
          title:   "New Member Joined!",
          message: `${session.user.name} (${session.user.email}) joined your workspace`,
          link:    "/team",
        }
      })
    }

    return Response.json({ message: "Invitation accepted!" })
  } catch (err: any) {
    console.error(err)
    return Response.json({ message: "Internal server error" }, { status: 500 })
  }
}