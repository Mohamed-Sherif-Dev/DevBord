import { prisma }  from "@/lib/db"
import { v4 as uuid } from "uuid"

export async function POST(req: Request) {
  try {
    const { email } = await req.json()
    if (!email) return Response.json({ message: "Email required" }, { status: 400 })

    const user = await prisma.user.findUnique({ where: { email } })

    // مش بنقول للـ user لو الإيميل مش موجود — security best practice
    if (!user) {
      return Response.json({ message: "If this email exists, you will receive an OTP" })
    }

    // Generate 6-digit OTP
    const otp       = Math.floor(100000 + Math.random() * 900000).toString()
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000) // 10 minutes

    // Save OTP
    await prisma.verificationToken.create({
      data: {
        userId:    user.id,
        token:     otp,
        type:      "PASSWORD_RESET",
        expiresAt,
      }
    }).catch(async () => {
      // لو موجود — update
      await prisma.verificationToken.deleteMany({
        where: { userId: user.id, type: "PASSWORD_RESET" }
      })
      await prisma.verificationToken.create({
        data: {
          userId:    user.id,
          token:     otp,
          type:      "PASSWORD_RESET",
          expiresAt,
        }
      })
    })

    // Send OTP Email
    if (process.env.MAIL_USER && process.env.MAIL_PASS) {
      const nodemailer  = await import("nodemailer")
      const transporter = nodemailer.default.createTransport({
        host:   "smtp.gmail.com",
        port:   587,
        secure: false,
        auth: {
          user: process.env.MAIL_USER,
          pass: process.env.MAIL_PASS,
        },
        tls: { rejectUnauthorized: false }
      })

      await transporter.sendMail({
        from:    process.env.MAIL_FROM || process.env.MAIL_USER,
        to:      email,
        subject: "🔐 DevBoard — Password Reset OTP",
        html: `
        <div style="font-family:Inter,sans-serif;max-width:480px;margin:0 auto;
          background:#0d0d1a;border-radius:16px;overflow:hidden;border:1px solid #1e1e3a;">

          <div style="background:linear-gradient(135deg,#7c3aed,#06b6d4);
            padding:32px;text-align:center;">
            <div style="font-size:40px;margin-bottom:8px">🔐</div>
            <h1 style="color:white;font-size:22px;font-weight:900;margin:0">
              Password Reset
            </h1>
            <p style="color:rgba(255,255,255,0.7);font-size:13px;margin:6px 0 0">
              DevBoard — Task Management
            </p>
          </div>

          <div style="padding:32px;text-align:center;">
            <p style="color:#a0a0c0;font-size:15px;margin-bottom:24px;">
              Hey <strong style="color:#f0f0ff">${user.name}</strong>! 👋<br/>
              Use this OTP to reset your password.
            </p>

            <!-- OTP Code -->
            <div style="background:#1a1a2e;border:2px solid #7c3aed;
              border-radius:16px;padding:24px;margin-bottom:24px;display:inline-block;">
              <p style="color:#7c7ca8;font-size:12px;margin:0 0 8px;
                text-transform:uppercase;letter-spacing:2px;">Your OTP Code</p>
              <p style="color:#f0f0ff;font-size:40px;font-weight:900;
                letter-spacing:12px;margin:0;font-family:monospace;">
                ${otp}
              </p>
            </div>

            <p style="color:#f59e0b;font-size:13px;margin-bottom:24px;">
              ⏰ This OTP expires in <strong>10 minutes</strong>
            </p>

            <p style="color:#4a4a6a;font-size:12px;margin:0;">
              If you didn't request this, ignore this email.<br/>
              DevBoard 🚀
            </p>
          </div>
        </div>
        `,
      })
    }

    return Response.json({ message: "OTP sent successfully!" })
  } catch (err: any) {
    console.error(err)
    return Response.json({ message: "Internal server error" }, { status: 500 })
  }
}