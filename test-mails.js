const nodemailer = require("nodemailer")

async function test() {
  const transporter = nodemailer.createTransport({
    host:   "smtp.gmail.com",
    port:   587,
    secure: false,
    auth: {
      user: "بريدك@gmail.com",        // ← غيره
      pass: "xxxx xxxx xxxx xxxx",    // ← App Password
    },
  })

  try {
    await transporter.verify()
    console.log("✅ SMTP Connected!")

    await transporter.sendMail({
      from:    "بريدك@gmail.com",
      to:      "بريدك@gmail.com",    // ← ابعت لنفسك
      subject: "DevBoard Test Email",
      text:    "Email is working! 🚀",
    })
    console.log("✅ Email sent!")
  } catch (err) {
    console.error("❌ Error:", err.message)
  }
}

test()