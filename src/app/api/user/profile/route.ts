import { getServerSession } from "next-auth"
import { authOptions }      from "@/lib/auth"
import { prisma }           from "@/lib/db"
import { successResponse, errorResponse } from "@/lib/response"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) return errorResponse("Unauthorized", 401)

    const userId = (session.user as any).id

    const user = await prisma.user.findUnique({
      where:  { id: userId },
      select: {
        id:        true,
        name:      true,
        email:     true,
        image:     true,
        bio:       true,
        jobTitle:  true,
        timezone:  true,
        createdAt: true,
      }
    })

    return successResponse(user)
  } catch (err) {
    return errorResponse("Internal server error", 500)
  }
}

export async function PATCH(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) return errorResponse("Unauthorized", 401)

    const userId = (session.user as any).id
    const { name, bio, jobTitle, timezone, image } = await req.json()

    const user = await prisma.user.update({
      where: { id: userId },
      data:  {
        ...(name     && { name     }),
        ...(bio      !== undefined && { bio      }),
        ...(jobTitle !== undefined && { jobTitle }),
        ...(timezone && { timezone }),
        ...(image    && { image    }),
      },
      select: {
        id:       true,
        name:     true,
        email:    true,
        image:    true,
        bio:      true,
        jobTitle: true,
        timezone: true,
      }
    })

    return successResponse(user, "Profile updated!")
  } catch (err) {
    console.error(err)
    return errorResponse("Internal server error", 500)
  }
}