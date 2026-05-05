import { prisma } from "@/lib/db"

export async function POST(req: Request) {
  try {
    const { email, otp } = await req.json()
    if (!email || !otp) {
      return Response.json({ message: "Email and OTP required" }, { status: 400 })
    }

    const user = await prisma.user.findUnique({ where: { email } })
    if (!user) return Response.json({ message: "Invalid OTP" }, { status: 400 })

    const token = await prisma.verificationToken.findFirst({
      where: {
        userId:    user.id,
        token:     otp,
        type:      "PASSWORD_RESET",
        usedAt:    null,
        expiresAt: { gt: new Date() }
      }
    })

    if (!token) {
      return Response.json({ message: "Invalid or expired OTP" }, { status: 400 })
    }

    // Mark as used
    await prisma.verificationToken.update({
      where: { id: token.id },
      data:  { usedAt: new Date() }
    })

    // Generate reset token
    const resetToken = token.id + "-" + Date.now()

    return Response.json({
      message:    "OTP verified!",
      resetToken,
    })
  } catch (err: any) {
    console.error(err)
    return Response.json({ message: "Internal server error" }, { status: 500 })
  }
}