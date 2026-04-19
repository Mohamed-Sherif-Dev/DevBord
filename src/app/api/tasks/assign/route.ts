import { NextRequest }   from "next/server"
import { getServerSession } from "next-auth"
import { authOptions }   from "@/lib/auth"


export async function POST(req: Request) {
  try {
    const body = await req.json()
    const {
      taskTitle,
      assigneeEmail,
      assigneeName,
      priority,
      dueDate,
      projectName,
    } = body

    if (!taskTitle || !assigneeEmail) {
      return Response.json(
        { message: "Missing required fields" },
        { status: 400 }
      )
    }

    // Check SMTP
    if (!process.env.MAIL_USER || !process.env.MAIL_PASS) {
      console.log("⚠️ SMTP not configured")
      return Response.json({ message: "Task created", emailSent: false })
    }

    const nodemailer = await import("nodemailer")

    const transporter = nodemailer.default.createTransport({
      host:   "smtp.gmail.com",
      port:   587,
      secure: false,
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
      },
      tls: {
        rejectUnauthorized: false
      }
    })

    const priorityColor: Record<string, string> = {
      URGENT: "#ef4444",
      HIGH:   "#f97316",
      MEDIUM: "#f59e0b",
      LOW:    "#22c55e",
    }

    await transporter.sendMail({
      from:    process.env.MAIL_FROM || process.env.MAIL_USER,
      to:      assigneeEmail,
      subject: `📋 New Task: "${taskTitle}"`,
      html: `
      <div style="font-family:Inter,sans-serif;max-width:560px;margin:0 auto;
        background:#0d0d1a;border-radius:16px;overflow:hidden;border:1px solid #1e1e3a;">

        <div style="background:linear-gradient(135deg,#7c3aed,#06b6d4);
          padding:32px;text-align:center;">
          <div style="font-size:40px;margin-bottom:8px">📋</div>
          <h1 style="color:white;font-size:22px;font-weight:900;margin:0">
            New Task Assigned!
          </h1>
          <p style="color:rgba(255,255,255,0.7);font-size:13px;margin:6px 0 0">
            DevBoard — Task Management
          </p>
        </div>

        <div style="padding:32px;">
          <p style="color:#a0a0c0;font-size:15px;margin-bottom:24px;">
            Hey <strong style="color:#f0f0ff">
              ${assigneeName || "Teammate"}
            </strong>! 👋<br/>
            You have a new task assigned to you.
          </p>

          <div style="background:#1a1a2e;border:1px solid #2a2a4a;
            border-radius:12px;padding:20px;margin-bottom:24px;">
            <h2 style="color:#f0f0ff;font-size:18px;
              font-weight:800;margin:0 0 12px;">
              ${taskTitle}
            </h2>
            <div style="display:flex;gap:8px;flex-wrap:wrap;">
              <span style="background:#2a1a4a;color:#a78bfa;
                padding:4px 12px;border-radius:8px;
                font-size:12px;font-weight:600;">
                📁 ${projectName || "DevBoard"}
              </span>
              <span style="background:${(priorityColor[priority] || "#8b5cf6")}20;
                color:${priorityColor[priority] || "#8b5cf6"};
                padding:4px 12px;border-radius:8px;font-size:12px;
                font-weight:600;">
                ⚡ ${priority || "MEDIUM"}
              </span>
              ${dueDate ? `
              <span style="background:#1e1e3a;color:#94a3b8;
                padding:4px 12px;border-radius:8px;font-size:12px;">
                📅 Due: ${dueDate}
              </span>` : ""}
            </div>
          </div>

          <a href="${process.env.APP_URL || "http://localhost:3000"}/projects"
            style="display:block;text-align:center;
            background:linear-gradient(135deg,#7c3aed,#06b6d4);
            color:white;text-decoration:none;padding:14px 24px;
            border-radius:12px;font-weight:800;font-size:15px;
            margin-bottom:24px;">
            View Task →
          </a>

          <p style="color:#4a4a6a;font-size:12px;text-align:center;margin:0;">
            DevBoard 🚀
          </p>
        </div>
      </div>
      `,
    })

    return Response.json({ message: "Email sent!", emailSent: true })

  } catch (err: any) {
    console.error("❌ Error:", err.message)
    return Response.json(
      { message: err.message },
      { status: 500 }
    )
  }
}