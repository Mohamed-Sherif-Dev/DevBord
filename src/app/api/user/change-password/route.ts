import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import bcrypt from "bcryptjs";
import { successResponse, errorResponse } from "@/lib/response";



export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) return errorResponse("Unauthorized", 401);

        const userId = (session.user as any).id
        const { currentPassword, newPassword, confirmPassword } = await req.json();

        if (!currentPassword || !newPassword || !confirmPassword) {
            return errorResponse("All fields are required", 400);
        }

        if (newPassword !== confirmPassword) {
            return errorResponse("New password and confirm password do not match", 400);
        }

        if (newPassword.length < 8) {
            return errorResponse("New password must be at least 8 characters long", 400);
        }

        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (!user?.password) {
            return errorResponse("User does not have a password set", 400);
        }

        // Verify current password
        const isVaild = await bcrypt.compare(currentPassword, user.password);
        if (!isVaild) {
            return errorResponse("Current password is incorrect", 400);
        }

        // Hash new password
        const hshed = await bcrypt.hash(newPassword, 12);

        await prisma.user.update({
            where: { id: userId },
            data: { password: hshed }
        })
        return successResponse("Password updated successfully");
    } catch (error) {
        console.log(error);
        return errorResponse("An error occurred while updating the password", 500);
    }
}