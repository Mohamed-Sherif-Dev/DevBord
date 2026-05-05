import { prisma } from "@/lib/db"
import bcrypt     from "bcryptjs"

export async function POST(req: Request) {
  try {
    const { email, resetToken, newPassword } = await req.json()

    if (!email || !resetToken || !newPassword) {
      return Response.json({ message: "All fields required" }, { status: 400 })
    }

    if (newPassword.length < 8) {
      return Response.json({ message: "Password must be at least 8 characters" }, { status: 400 })
    }

    const user = await prisma.user.findUnique({ where: { email } })
    if (!user) return Response.json({ message: "Invalid request" }, { status: 400 })

    // Hash new password
    const hashed = await bcrypt.hash(newPassword, 12)

    // Update password
    await prisma.user.update({
      where: { id: user.id },
      data:  {
        password:     hashed,
        failedLogins: 0,
        lockedUntil:  null,
      }
    })

    return Response.json({ message: "Password reset successfully!" })
  } catch (err: any) {
    console.error(err)
    return Response.json({ message: "Internal server error" }, { status: 500 })
  }
}