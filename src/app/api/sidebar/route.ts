import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const items = await prisma.sidebarItem.findMany({
    orderBy: { order: "asc" },
    include: { children: { orderBy: { order: "asc" } } },
  });
  return NextResponse.json(items);
}
