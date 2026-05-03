// import { getServerSession } from "next-auth"
// import { authOptions }      from "@/lib/auth"
// import { prisma }           from "@/lib/db"

// export async function POST(req: Request) {
//   try {
//     const session = await getServerSession(authOptions)
//     if (!session?.user) {
//       return Response.json({ message: "Unauthorized" }, { status: 401 })
//     }

//     const { messages, projectId } = await req.json()

//     // Get context
//     let context = `You are DevBoard AI, an intelligent assistant for a task management platform.
// You help developers with:
// - Task management and sprint planning
// - Code writing, review and debugging
// - Technical problem solving
// - Project documentation
// - Team collaboration
// Always respond in the same language the user writes in.`

//     if (projectId) {
//       try {
//         const project = await prisma.project.findUnique({
//           where:   { id: projectId },
//           include: {
//             tasks: {
//               where:  { deletedAt: null },
//               select: { title: true, status: true, priority: true },
//               take:   20,
//             },
//             members: {
//               include: { user: { select: { name: true } } }
//             }
//           }
//         })

//         if (project) {
//           context += `\n\nCurrent Project: ${project.name}
// Team: ${project.members.map(m => m.user.name).join(", ")}
// Tasks:\n${project.tasks.map(t => `- ${t.title} (${t.status}, ${t.priority})`).join("\n")}`
//         }
//       } catch {}
//     }

//     // Call OpenRouter
//     const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
//       method:  "POST",
//       headers: {
//         "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
//         "Content-Type":  "application/json",
//         "HTTP-Referer":  process.env.APP_URL || "http://localhost:3000",
//         "X-Title":       "DevBoard AI",
//       },
//       body: JSON.stringify({
//         model:       "meta-llama/llama-3.1-8b-instruct:free",
//         stream:      true,
//         messages:    [
//           { role: "system", content: context },
//           ...messages
//         ],
//         max_tokens:  1500,
//         temperature: 0.7,
//       }),
//     })

//     if (!response.ok) {
//       const err = await response.text()
//       console.error("OpenRouter error:", err)
//       return Response.json({ message: "AI service error" }, { status: 500 })
//     }

//     // ✅ Transform stream correctly
//     const encoder = new TextEncoder()
//     const decoder = new TextDecoder()

//     const stream = new ReadableStream({
//       async start(controller) {
//         const reader = response.body!.getReader()

//         try {
//           while (true) {
//             const { done, value } = await reader.read()
//             if (done) break

//             const chunk = decoder.decode(value, { stream: true })
//             const lines = chunk.split("\n")

//             for (const line of lines) {
//               const trimmed = line.trim()
//               if (!trimmed || !trimmed.startsWith("data: ")) continue

//               const data = trimmed.slice(6)
//               if (data === "[DONE]") {
//                 controller.enqueue(encoder.encode("data: [DONE]\n\n"))
//                 continue
//               }

//               try {
//                 const parsed = JSON.parse(data)
//                 const token  = parsed.choices?.[0]?.delta?.content

//                 if (token) {
//                   controller.enqueue(
//                     encoder.encode(`data: ${JSON.stringify({ token })}\n\n`)
//                   )
//                 }
//               } catch {}
//             }
//           }
//         } catch (err) {
//           console.error("Stream error:", err)
//         } finally {
//           controller.close()
//         }
//       }
//     })

//     return new Response(stream, {
//       headers: {
//         "Content-Type":  "text/event-stream",
//         "Cache-Control": "no-cache",
//         "Connection":    "keep-alive",
//       }
//     })

//   } catch (err: any) {
//     console.error("AI error:", err)
//     return Response.json({ message: "Internal server error" }, { status: 500 })
//   }
// }



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