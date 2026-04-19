import nodemailer from "nodemailer"

const transporter = nodemailer.createTransport({
  host:   process.env.MAIL_HOST || "smtp.gmail.com",
  port:   Number(process.env.MAIL_PORT) || 587,
  secure: false,
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
})

export async function sendTaskAssignedEmail(opts: {
  to:           string
  assigneeName: string
  taskTitle:    string
  projectName:  string
  priority:     string
  dueDate?:     string
  assignedBy:   string
  taskUrl:      string
}) {
  const priorityColor: Record<string, string> = {
    URGENT: "#ef4444",
    HIGH:   "#f97316",
    MEDIUM: "#f59e0b",
    LOW:    "#22c55e",
  }

  await transporter.sendMail({
    from:    process.env.MAIL_FROM,
    to:      opts.to,
    subject: `📋 New Task: "${opts.taskTitle}"`,
    html: `
    <div style="font-family:Inter,sans-serif;max-width:560px;margin:0 auto;background:#0d0d1a;border-radius:16px;overflow:hidden;border:1px solid #1e1e3a;">

      <!-- Header -->
      <div style="background:linear-gradient(135deg,#7c3aed,#06b6d4);padding:32px;text-align:center;">
        <div style="font-size:40px;margin-bottom:8px">📋</div>
        <h1 style="color:white;font-size:22px;font-weight:900;margin:0">New Task Assigned!</h1>
        <p style="color:rgba(255,255,255,0.7);font-size:13px;margin:6px 0 0">DevBoard — Task Management</p>
      </div>

      <!-- Body -->
      <div style="padding:32px;">
        <p style="color:#a0a0c0;font-size:15px;margin-bottom:24px;">
          Hey <strong style="color:#f0f0ff">${opts.assigneeName}</strong>! 👋<br/>
          <strong style="color:#8b5cf6">${opts.assignedBy}</strong> assigned you a new task.
        </p>

        <!-- Task Card -->
        <div style="background:#1a1a2e;border:1px solid #2a2a4a;border-radius:12px;padding:20px;margin-bottom:24px;">
          <h2 style="color:#f0f0ff;font-size:18px;font-weight:800;margin:0 0 12px;">
            ${opts.taskTitle}
          </h2>
          <div style="display:flex;gap:8px;flex-wrap:wrap;">
            <span style="background:#2a1a4a;color:#a78bfa;padding:4px 12px;border-radius:8px;font-size:12px;font-weight:600;">
              📁 ${opts.projectName}
            </span>
            <span style="background:${priorityColor[opts.priority] || "#8b5cf6"}20;color:${priorityColor[opts.priority] || "#8b5cf6"};padding:4px 12px;border-radius:8px;font-size:12px;font-weight:600;border:1px solid ${priorityColor[opts.priority] || "#8b5cf6"}40;">
              ⚡ ${opts.priority}
            </span>
            ${opts.dueDate ? `
            <span style="background:#1e1e3a;color:#94a3b8;padding:4px 12px;border-radius:8px;font-size:12px;">
              📅 Due: ${opts.dueDate}
            </span>` : ""}
          </div>
        </div>

        <!-- CTA Button -->
        <a href="${opts.taskUrl}" style="
          display:block;text-align:center;
          background:linear-gradient(135deg,#7c3aed,#06b6d4);
          color:white;text-decoration:none;
          padding:14px 24px;border-radius:12px;
          font-weight:800;font-size:15px;
          margin-bottom:24px;
        ">
          View Task →
        </a>

        <p style="color:#4a4a6a;font-size:12px;text-align:center;margin:0;">
          DevBoard — Where dev teams ship faster 🚀
        </p>
      </div>
    </div>
    `,
  })
}

export async function sendWelcomeEmail(opts: { to: string; name: string }) {
  await transporter.sendMail({
    from:    process.env.MAIL_FROM,
    to:      opts.to,
    subject: "Welcome to DevBoard! 🚀",
    html: `
    <div style="font-family:Inter,sans-serif;max-width:560px;margin:0 auto;background:#0d0d1a;border-radius:16px;overflow:hidden;border:1px solid #1e1e3a;">
      <div style="background:linear-gradient(135deg,#7c3aed,#06b6d4);padding:32px;text-align:center;">
        <div style="font-size:40px;margin-bottom:8px">🚀</div>
        <h1 style="color:white;font-size:22px;font-weight:900;margin:0">Welcome to DevBoard!</h1>
      </div>
      <div style="padding:32px;">
        <p style="color:#a0a0c0;font-size:15px;margin-bottom:24px;">
          Hey <strong style="color:#f0f0ff">${opts.name}</strong>! 🎉<br/>
          Your account is ready. Time to ship together! 🚀
        </p>
        <a href="${process.env.APP_URL}/dashboard" style="
          display:block;text-align:center;
          background:linear-gradient(135deg,#7c3aed,#06b6d4);
          color:white;text-decoration:none;
          padding:14px 24px;border-radius:12px;
          font-weight:800;font-size:15px;
        ">
          Go to Dashboard →
        </a>
      </div>
    </div>
    `,
  })
}