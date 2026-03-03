import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const components = await prisma.headerComponent.findMany({
    orderBy: { position: "asc" },
  });

  return NextResponse.json(
    components.map((c) => ({
      id: c.id,
      type: c.type,
      position: c.position,
      config: JSON.parse(c.config),
    }))
  );
}
