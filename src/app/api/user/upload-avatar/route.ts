import { getServerSession } from "next-auth"
import { authOptions }      from "@/lib/auth"
import { prisma }           from "@/lib/db"
import { successResponse, errorResponse } from "@/lib/response"

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) return errorResponse("Unauthorized", 401)

    const userId  = (session.user as any).id
    const formData = await req.formData()
    const file     = formData.get("avatar") as File

    if (!file) return errorResponse("No file uploaded")

    // Validate
    const validTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"]
    if (!validTypes.includes(file.type)) {
      return errorResponse("Invalid file type. Use JPEG, PNG, WebP or GIF")
    }

    if (file.size > 2 * 1024 * 1024) {
      return errorResponse("File too large. Max 2MB")
    }

    // Convert to base64
    const bytes  = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const base64 = `data:${file.type};base64,${buffer.toString("base64")}`

    // Save to DB
    const user = await prisma.user.update({
      where:  { id: userId },
      data:   { image: base64 },
      select: { id: true, image: true }
    })

    return successResponse(user, "Avatar updated!")
  } catch (err) {
    console.error(err)
    return errorResponse("Internal server error", 500)
  }
}