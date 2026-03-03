import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST() {
  try {
    const notification = await prisma.headerComponent.findFirst({
      where: { type: "notification" },
    });

    if (!notification) {
      return NextResponse.json(
        { success: false, error: "Notification component not found" },
        { status: 404 }
      );
    }

    const config = JSON.parse(notification.config);
    delete config.count; // Remove hardcoded count

    await prisma.headerComponent.update({
      where: { id: notification.id },
      data: { config: JSON.stringify(config) },
    });

    return NextResponse.json({
      success: true,
      message: "Removed hardcoded count - will now auto-calculate from unread items",
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: String(error) },
      { status: 500 }
    );
  }
}
