import { getServerSession } from "next-auth"
import { authOptions }      from "@/lib/auth"
import { prisma }           from "@/lib/db"
import { successResponse, errorResponse } from "@/lib/response"

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) return errorResponse("Unauthorized", 401)

    const { id } = await params
    const userId = (session.user as any).id
    const body   = await req.json()

    const { columnId, status, ...rest } = body

    const task = await prisma.task.update({
      where: { id },
      data:  {
        ...rest,
        ...(columnId && { columnId }),
        ...(status   && { status }),
        ...(status === "DONE" && { completedAt: new Date() }),
        ...(body.dueDate && { dueDate: new Date(body.dueDate) }),
        updatedAt: new Date(),
      },
      include: {
        assignee: { select: { id: true, name: true, image: true } },
        labels:   { include: { label: true } },
        _count:   { select: { comments: true, subtasks: true } },
      }
    })

    // Log
    await prisma.activityLog.create({
      data: {
        projectId:   task.projectId,
        taskId:      task.id,
        userId,
        type:        "TASK_UPDATED",
        description: `Updated task "${task.title}"`,
        metadata:    body,
      }
    }).catch(console.error)

    return successResponse(task, "Task updated")
  } catch (err) {
    console.error(err)
    return errorResponse("Internal server error", 500)
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) return errorResponse("Unauthorized", 401)

    const { id } = await params

    await prisma.task.update({
      where: { id },
      data:  { deletedAt: new Date() }
    })

    return successResponse(null, "Task deleted")
  } catch (err) {
    return errorResponse("Internal server error", 500)
  }
}

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) return errorResponse("Unauthorized", 401)

    const { id } = await params

    const task = await prisma.task.findUnique({
      where:   { id, deletedAt: null },
      include: {
        assignee:    { select: { id: true, name: true, image: true, email: true } },
        createdBy:   { select: { id: true, name: true, image: true } },
        labels:      { include: { label: true } },
        subtasks:    { where: { deletedAt: null }, orderBy: { order: "asc" } },
        attachments: true,
        comments: {
          where:   { deletedAt: null },
          include: { user: { select: { id: true, name: true, image: true } } },
          orderBy: { createdAt: "asc" },
        },
        timeEntries: {
          include: { user: { select: { id: true, name: true } } },
          orderBy: { startedAt: "desc" },
        },
        _count: { select: { comments: true, subtasks: true, attachments: true } },
      }
    })

    if (!task) return errorResponse("Task not found", 404)
    return successResponse(task)
  } catch (err) {
    return errorResponse("Internal server error", 500)
  }
}