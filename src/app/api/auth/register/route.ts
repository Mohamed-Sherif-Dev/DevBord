import { NextRequest }  from "next/server"
import { prisma }       from "@/lib/db"
import bcrypt           from "bcryptjs"

export async function POST(req: NextRequest) {
  try {
    const { name, email, password } = await req.json()

    if (!name || !email || !password) {
      return Response.json(
        { message: "All fields required" },
        { status: 400 }
      )
    }

    if (password.length < 8) {
      return Response.json(
        { message: "Password must be at least 8 characters" },
        { status: 400 }
      )
    }

    const exists = await prisma.user.findUnique({ where: { email } })
    if (exists) {
      return Response.json(
        { message: "Email already registered" },
        { status: 409 }
      )
    }

    const hashed = await bcrypt.hash(password, 12)

    const user = await prisma.user.create({
      data: { name, email, password: hashed },
      select: { id: true, name: true, email: true }
    })

    return Response.json(
      { message: "Account created successfully", data: user },
      { status: 201 }
    )
  } catch (err) {
    console.error("Register error:", err)
    return Response.json(
      { message: "Internal server error" },
      { status: 500 }
    )
  }
}