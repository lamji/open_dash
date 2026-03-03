import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ key: string }> }
) {
  const { key } = await params;
  const config = await prisma.appConfig.findUnique({ where: { key } });

  if (!config) {
    return NextResponse.json(null, { status: 200 });
  }

  return NextResponse.json(JSON.parse(config.value));
}
