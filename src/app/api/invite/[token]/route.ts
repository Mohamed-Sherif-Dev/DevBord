import { prisma } from "@/lib/db"

export async function GET(
  req: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params

    const invite = await prisma.invitation.findUnique({
      where:   { token },
      include: {
        workspace: {
          include: {
            _count: { select: { members: true } }
          }
        }
      }
    })

    if (!invite) {
      return Response.json({ message: "Invitation not found" }, { status: 404 })
    }

    if (invite.expiresAt < new Date()) {
      return Response.json({ message: "Invitation has expired" }, { status: 410 })
    }

    if (invite.acceptedAt) {
      return Response.json({ message: "Invitation already accepted" }, { status: 409 })
    }

    return Response.json({ data: invite })
  } catch (err) {
    return Response.json({ message: "Internal server error" }, { status: 500 })
  }
}