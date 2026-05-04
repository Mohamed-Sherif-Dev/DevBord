import { getServerSession } from "next-auth"
import { authOptions }      from "@/lib/auth"
import { prisma }           from "@/lib/db"
import { successResponse, errorResponse } from "@/lib/response"
import { z } from "zod"

const createSchema = z.object({
  title:       z.string().min(1).max(500),
  description: z.string().optional(),
  projectId:   z.string(),
  columnId:    z.string().optional(),
  assigneeId:  z.string().optional(),
  priority:    z.enum(["URGENT","HIGH","MEDIUM","LOW"]).default("MEDIUM"),
  dueDate:     z.string().optional(),
  parentId:    z.string().optional(),
  tags:        z.array(z.string()).optional(),
})

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) return errorResponse("Unauthorized", 401)

    const userId = (session.user as any).id
    const body   = await req.json()
    const parsed = createSchema.safeParse(body)
    if (!parsed.success) return errorResponse(parsed.error.issues[0].message)

    // Get max order in column
    const maxOrder = await prisma.task.aggregate({
      where:   { columnId: parsed.data.columnId, deletedAt: null },
      _max:    { order: true }
    })

    const task = await prisma.task.create({
      data: {
        ...parsed.data,
        createdById: userId,
        order:       (maxOrder._max.order || 0) + 1000,
        dueDate:     parsed.data.dueDate ? new Date(parsed.data.dueDate) : null,
      },
      include: {
        assignee:  { select: { id: true, name: true, image: true, email: true } },
        createdBy: { select: { id: true, name: true } },
        labels:    { include: { label: true } },
        _count:    { select: { comments: true, subtasks: true } },
      }
    })

    // Log activity
    await prisma.activityLog.create({
      data: {
        projectId:   parsed.data.projectId,
        taskId:      task.id,
        userId,
        type:        "TASK_CREATED",
        description: `Created task "${task.title}"`,
      }
    })

    // Send email if assigned to someone else
    if (task.assigneeId && task.assigneeId !== userId && task.assignee?.email) {
      const project = await prisma.project.findUnique({
        where:  { id: parsed.data.projectId },
        select: { name: true }
      })

      // Fire and forget
      fetch(`${process.env.APP_URL}/api/tasks/assign`, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          taskTitle:     task.title,
          assigneeEmail: task.assignee.email,
          assigneeName:  task.assignee.name,
          priority:      task.priority,
          dueDate:       task.dueDate?.toISOString().split("T")[0],
          projectName:   project?.name || "DevBoard",
        }),
      }).catch(console.error)
    }

    return successResponse(task, "Task created", 201)
  } catch (err) {
    console.error(err)
    return errorResponse("Internal server error", 500)
  }
}




export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) return errorResponse("Unauthorized", 401)

    const userId = (session.user as any).id
    const { searchParams } = new URL(req.url)
    const search    = searchParams.get("search")
    const projectId = searchParams.get("projectId")

    const tasks = await prisma.task.findMany({
      where: {
        deletedAt: null,
        // ✅ بس tasks في projects الـ user عضو فيها
        project: {
          members: { some: { userId } }
        },
        ...(projectId ? { projectId } : {}),
        ...(search ? {
          title: { contains: search, mode: "insensitive" }
        } : {
          assigneeId: userId
        }),
      },
      include: {
        assignee: { select: { id: true, name: true, image: true } },
        project:  { select: { id: true, name: true, color: true } },
        _count:   { select: { comments: true, subtasks: true } },
      },
      orderBy: [{ priority: "asc" }, { order: "asc" }],
      take: 50,
    })

    return successResponse(tasks)
  } catch (err) {
    console.error(err)
    return errorResponse("Internal server error", 500)
  }
}