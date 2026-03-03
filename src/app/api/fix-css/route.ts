import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST() {
  try {
    const components = await prisma.headerComponent.findMany();
    const updates = [];

    for (const component of components) {
      const config = JSON.parse(component.config);
      let updated = false;

      // Fix inputClassName
      if (config.inputClassName && config.inputClassName.includes("!important")) {
        config.inputClassName = "focus:outline-none focus:ring-0 focus:border-transparent";
        updated = true;
      }

      // Fix className
      if (config.className && config.className.includes("!important")) {
        config.className = config.className.replace(/\s*!important;?/g, "").replace(/;/g, " ").trim();
        updated = true;
      }

      // Fix dropdownClassName
      if (config.dropdownClassName && config.dropdownClassName.includes("!important")) {
        config.dropdownClassName = config.dropdownClassName.replace(/\s*!important;?/g, "").replace(/;/g, " ").trim();
        updated = true;
      }

      // Fix itemClassName
      if (config.itemClassName && config.itemClassName.includes("!important")) {
        config.itemClassName = config.itemClassName.replace(/\s*!important;?/g, "").replace(/;/g, " ").trim();
        updated = true;
      }

      // Fix avatarClassName
      if (config.avatarClassName && config.avatarClassName.includes("!important")) {
        config.avatarClassName = config.avatarClassName.replace(/\s*!important;?/g, "").replace(/;/g, " ").trim();
        updated = true;
      }

      if (updated) {
        await prisma.headerComponent.update({
          where: { id: component.id },
          data: { config: JSON.stringify(config) },
        });
        updates.push({ id: component.id, type: component.type });
      }
    }

    return NextResponse.json({
      success: true,
      message: "Fixed all CSS-in-JS styles to Tailwind classes",
      updated: updates,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: String(error) },
      { status: 500 }
    );
  }
}
