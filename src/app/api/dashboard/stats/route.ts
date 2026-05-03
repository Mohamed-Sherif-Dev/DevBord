import { getServerSession } from "next-auth"
import { authOptions }      from "@/lib/auth"
import { prisma }           from "@/lib/db"
import { successResponse, errorResponse } from "@/lib/response"

// export async function GET() {
//   try {
//     const session = await getServerSession(authOptions)
//     if (!session?.user) return errorResponse("Unauthorized", 401)

//     const userId = (session.user as any).id

//     const [
//       totalTasks,
//       inProgressTasks,
//       dueTodayTasks,
//       completedTasks,
//       recentActivity,
//       myTasks,
//     ] = await Promise.all([
//       // Total tasks assigned to me
//       prisma.task.count({
//         where: { assigneeId: userId, deletedAt: null }
//       }),
//       // In progress
//       prisma.task.count({
//         where: { assigneeId: userId, status: "IN_PROGRESS", deletedAt: null }
//       }),
//       // Due today
//       prisma.task.count({
//         where: {
//           assigneeId: userId,
//           deletedAt:  null,
//           dueDate: {
//             gte: new Date(new Date().setHours(0,0,0,0)),
//             lte: new Date(new Date().setHours(23,59,59,999)),
//           }
//         }
//       }),
//       // Completed this week
//       prisma.task.count({
//         where: {
//           assigneeId: userId,
//           status:     "DONE",
//           deletedAt:  null,
//           updatedAt: {
//             gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
//           }
//         }
//       }),
//       // Recent activity
//       prisma.activityLog.findMany({
//         where: {
//           project: {
//             members: { some: { userId } }
//           }
//         },
//         include: { user: { select: { id: true, name: true, image: true } } },
//         orderBy: { createdAt: "desc" },
//         take: 10,
//       }),
//       // My tasks
//       prisma.task.findMany({
//         where: {
//           assigneeId: userId,
//           deletedAt:  null,
//           status:     { not: "DONE" }
//         },
//         include: {
//           project: { select: { id: true, name: true, color: true } },
//           labels:  { include: { label: true } },
//         },
//         orderBy: [
//           { priority: "asc" },
//           { dueDate: "asc" }
//         ],
//         take: 10,
//       }),
//     ])

//     return successResponse({
//       stats: {
//         totalTasks,
//         inProgressTasks,
//         dueTodayTasks,
//         completedTasks,
//       },
//       recentActivity,
//       myTasks,
//     })
//   } catch (err) {
//     console.error(err)
//     return errorResponse("Internal server error", 500)
//   }
// }

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) return errorResponse("Unauthorized", 401)

    const userId = (session.user as any).id

    const [totalTasks, inProgressTasks, dueTodayTasks, completedTasks, recentActivity, myTasks] =
      await Promise.all([
        // ✅ بس tasks في projects الـ user عضو فيها
        prisma.task.count({
          where: {
            assigneeId: userId,
            deletedAt:  null,
            project: { members: { some: { userId } } }
          }
        }),
        prisma.task.count({
          where: {
            assigneeId: userId,
            status:     "IN_PROGRESS",
            deletedAt:  null,
            project: { members: { some: { userId } } }
          }
        }),
        prisma.task.count({
          where: {
            assigneeId: userId,
            deletedAt:  null,
            project: { members: { some: { userId } } },
            dueDate: {
              gte: new Date(new Date().setHours(0,0,0,0)),
              lte: new Date(new Date().setHours(23,59,59,999)),
            }
          }
        }),
        prisma.task.count({
          where: {
            assigneeId: userId,
            status:     "DONE",
            deletedAt:  null,
            project: { members: { some: { userId } } },
            updatedAt: {
              gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
            }
          }
        }),
        // ✅ Activity بس في projects الـ user عضو فيها
        prisma.activityLog.findMany({
          where: {
            project: {
              members: { some: { userId } }
            }
          },
          include: { user: { select: { id: true, name: true, image: true } } },
          orderBy: { createdAt: "desc" },
          take:    10,
        }),
        // ✅ My tasks بس
        prisma.task.findMany({
          where: {
            assigneeId: userId,
            deletedAt:  null,
            status:     { not: "DONE" },
            project: { members: { some: { userId } } }
          },
          include: {
            project: { select: { id: true, name: true, color: true } },
            labels:  { include: { label: true } },
          },
          orderBy: [{ priority: "asc" }, { dueDate: "asc" }],
          take: 10,
        }),
      ])

    return successResponse({
      stats: { totalTasks, inProgressTasks, dueTodayTasks, completedTasks },
      recentActivity,
      myTasks,
    })
  } catch (err) {
    console.error(err)
    return errorResponse("Internal server error", 500)
  }
}