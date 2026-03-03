import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST() {
  try {
    const profileComp = await prisma.headerComponent.findFirst({
      where: { type: "profile" },
    });

    if (!profileComp) {
      return NextResponse.json(
        { success: false, error: "Profile component not found" },
        { status: 404 }
      );
    }

    const config = JSON.parse(profileComp.config);

    // Add custom menu items
    config.menuItems = [
      {
        id: "my-profile",
        label: "My Profile",
        type: "builtin",
        viewType: "my-profile",
        action: "view",
      },
      {
        id: "test-profile",
        label: "Test Profile",
        type: "custom",
        viewType: "test-profile",
        action: "view",
      },
      {
        id: "settings",
        label: "Settings",
        type: "builtin",
        viewType: "settings",
        action: "view",
      },
      {
        id: "logout",
        label: "Log Out",
        type: "builtin",
        action: "logout",
      },
    ];

    await prisma.headerComponent.update({
      where: { id: profileComp.id },
      data: { config: JSON.stringify(config) },
    });

    return NextResponse.json({
      success: true,
      message: "Profile menu items seeded successfully",
      menuItems: config.menuItems,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: String(error) },
      { status: 500 }
    );
  }
}
