import { NextRequest }       from "next/server"
import { getServerSession }  from "next-auth"
import { authOptions }       from "@/lib/auth"
import { prisma }            from "@/lib/db"
import { v4 as uuid }        from "uuid"

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return Response.json({ message: "Unauthorized" }, { status: 401 })
    }

    const { email, role, workspaceId } = await req.json()

    if (!email || !workspaceId) {
      return Response.json({ message: "Email and workspaceId required" }, { status: 400 })
    }

    // Check sender is admin/owner
    const member = await prisma.workspaceMember.findFirst({
      where: {
        workspaceId,
        userId: (session.user as any).id,
        role:   { in: ["OWNER", "ADMIN"] }
      }
    })
    if (!member) {
      return Response.json({ message: "Not authorized to invite" }, { status: 403 })
    }

    // Create invitation
    const token = uuid()
    await prisma.invitation.upsert({
      where:  { workspaceId_email: { workspaceId, email } },
      update: { token, role, expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) },
      create: {
        workspaceId,
        email,
        role:        role || "MEMBER",
        token,
        invitedById: (session.user as any).id,
        expiresAt:   new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      }
    })

    // Get workspace name
    const workspace = await prisma.workspace.findUnique({
      where:  { id: workspaceId },
      select: { name: true }
    })

    // Send email
    if (!process.env.MAIL_USER || !process.env.MAIL_PASS) {
      console.log("⚠️ SMTP not configured — skipping email")
      return Response.json({ message: "Invitation created (email skipped)", emailSent: false })
    }

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

    const inviteUrl = `${process.env.APP_URL}/invite/${token}`

    await transporter.sendMail({
      from:    process.env.MAIL_FROM || process.env.MAIL_USER,
      to:      email,
      subject: `🚀 You're invited to join ${workspace?.name} on DevBoard!`,
      html: `
      <div style="font-family:Inter,sans-serif;max-width:560px;margin:0 auto;
        background:#0d0d1a;border-radius:16px;overflow:hidden;border:1px solid #1e1e3a;">

        <div style="background:linear-gradient(135deg,#7c3aed,#06b6d4);
          padding:32px;text-align:center;">
          <div style="font-size:40px;margin-bottom:8px">🚀</div>
          <h1 style="color:white;font-size:22px;font-weight:900;margin:0">
            You're Invited!
          </h1>
          <p style="color:rgba(255,255,255,0.7);font-size:13px;margin:6px 0 0">
            DevBoard — Task Management
          </p>
        </div>

        <div style="padding:32px;">
          <p style="color:#a0a0c0;font-size:15px;margin-bottom:24px;">
            Hey! 👋<br/>
            <strong style="color:#8b5cf6">${session.user?.name}</strong>
            invited you to join
            <strong style="color:#f0f0ff"> ${workspace?.name}</strong>
            on DevBoard as a
            <strong style="color:#06b6d4"> ${role || "Member"}</strong>.
          </p>

          <div style="background:#1a1a2e;border:1px solid #2a2a4a;
            border-radius:12px;padding:20px;margin-bottom:24px;text-align:center;">
            <p style="color:#a0a0c0;font-size:13px;margin:0 0 4px;">
              This invitation expires in
            </p>
            <p style="color:#f59e0b;font-size:18px;font-weight:800;margin:0;">
              7 days ⏰
            </p>
          </div>

          <a href="${inviteUrl}"
            style="display:block;text-align:center;
            background:linear-gradient(135deg,#7c3aed,#06b6d4);
            color:white;text-decoration:none;
            padding:14px 24px;border-radius:12px;
            font-weight:800;font-size:15px;
            margin-bottom:24px;">
            Accept Invitation →
          </a>

          <p style="color:#4a4a6a;font-size:12px;text-align:center;margin:0;">
            If you didn't expect this invitation, you can ignore this email.<br/>
            DevBoard 🚀
          </p>
        </div>
      </div>
      `,
    })

    return Response.json({ message: "Invitation sent!", emailSent: true })

  } catch (err: any) {
    console.error("Invite error:", err.message)
    return Response.json({ message: err.message }, { status: 500 })
  }
}