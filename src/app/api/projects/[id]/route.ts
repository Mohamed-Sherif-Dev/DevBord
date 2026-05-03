import { getServerSession } from "next-auth"
import { authOptions }      from "@/lib/auth"
import { prisma }           from "@/lib/db"
import { successResponse, errorResponse } from "@/lib/response"

// export async function GET(
//   req: Request,
//   { params }: { params: Promise<{ id: string }> }
// ) {
//   try {
//     const session = await getServerSession(authOptions)
//     if (!session?.user) return errorResponse("Unauthorized", 401)

//     const { id } = await params
//     const userId = (session.user as any).id

//     // Check access via workspace membership
//     const project = await prisma.project.findFirst({
//       where: {
//         id,
//         deletedAt: null,
//         workspace: {
//           members: { some: { userId } }
//         }
//       },
//       include: {
//         columns: {
//           orderBy: { order: "asc" },
//           include: {
//             tasks: {
//               where:   { deletedAt: null, parentId: null },
//               orderBy: { order: "asc" },
//               include: {
//                 assignee: { select: { id: true, name: true, image: true } },
//                 labels:   { include: { label: true } },
//                 _count:   { select: { comments: true, subtasks: true, attachments: true } },
//               }
//             }
//           }
//         },
//         members: {
//           include: {
//             user: { select: { id: true, name: true, image: true, email: true } }
//           }
//         },
//         labels: true,
//         _count: {
//           select: { tasks: { where: { deletedAt: null } } }
//         }
//       }
//     })

//     if (!project) return errorResponse("Project not found or access denied", 404)
//     return successResponse(project)
//   } catch (err) {
//     console.error(err)
//     return errorResponse("Internal server error", 500)
//   }
// }

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) return errorResponse("Unauthorized", 401)

    const { id } = await params
    const userId = (session.user as any).id

    // ✅ لازم يكون member في المشروع نفسه
    const member = await prisma.projectMember.findFirst({
      where: { projectId: id, userId }
    })
    if (!member) return errorResponse("Access denied", 403)

    const project = await prisma.project.findUnique({
      where:   { id, deletedAt: null },
      include: {
        columns: {
          orderBy: { order: "asc" },
          include: {
            tasks: {
              where:   { deletedAt: null, parentId: null },
              orderBy: { order: "asc" },
              include: {
                assignee: { select: { id: true, name: true, image: true } },
                labels:   { include: { label: true } },
                _count:   { select: { comments: true, subtasks: true, attachments: true } },
              }
            }
          }
        },
        members: {
          include: {
            user: { select: { id: true, name: true, image: true, email: true } }
          }
        },
        labels: true,
        _count: { select: { tasks: { where: { deletedAt: null } } } }
      }
    })

    if (!project) return errorResponse("Project not found", 404)
    return successResponse(project)
  } catch (err) {
    console.error(err)
    return errorResponse("Internal server error", 500)
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) return errorResponse("Unauthorized", 401)

    const { id } = await params
    const body   = await req.json()

    const project = await prisma.project.update({
      where: { id },
      data:  body,
    })

    return successResponse(project, "Project updated")
  } catch (err) {
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

    await prisma.project.update({
      where: { id },
      data:  { deletedAt: new Date() }
    })

    return successResponse(null, "Project deleted")
  } catch (err) {
    return errorResponse("Internal server error", 500)
  }
}