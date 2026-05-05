

process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0"

import { getServerSession } from "next-auth"
import { authOptions }      from "@/lib/auth"

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return Response.json({ message: "Unauthorized" }, { status: 401 })
    }

    const { messages } = await req.json()

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method:  "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "Content-Type":  "application/json",
        "HTTP-Referer":  "http://localhost:3000",
        "X-Title":       "DevBoard",
      },
      body: JSON.stringify({
        model:       "meta-llama/llama-3.1-8b-instruct:free",
        stream:      false, // ✅ مش streaming دلوقتي
        messages:    [
          {
            role:    "system",
            content: "You are DevBoard AI, a helpful assistant for developers. Help with tasks, code, and project management. Always be concise and practical."
          },
          ...messages
        ],
        max_tokens:  1000,
      }),
    })

    console.log("OpenRouter status:", response.status)

    if (!response.ok) {
      const err = await response.text()
      console.error("OpenRouter error:", err)
      return Response.json({ message: "AI error: " + err }, { status: 500 })
    }

    const data = await response.json()
    console.log("OpenRouter response:", JSON.stringify(data).slice(0, 200))

    const content = data.choices?.[0]?.message?.content || ""

    return Response.json({ content })

  } catch (err: any) {
    console.error("AI catch error:", err.message)
    return Response.json({ message: err.message }, { status: 500 })
  }
}